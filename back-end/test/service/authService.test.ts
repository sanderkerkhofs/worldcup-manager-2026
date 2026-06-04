import { loginUser, registerGuestUser, getCurrentUser } from '../../service/authService';
import { NotFoundError, UnauthorizedError, ValidationError } from '../../util/errors';
import * as passwordUtil from '../../util/password';
import * as jwtUtil from '../../util/jwt';

jest.mock('../../repository/prisma/client', () => ({
  prisma: {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));
jest.mock('../../util/password');
jest.mock('../../util/jwt');

import { prisma } from '../../repository/prisma/client';

const mockPrisma = (prisma as any);
const mockHashPassword = (passwordUtil.hashPassword as any);
const mockComparePassword = (passwordUtil.comparePassword as any);
const mockSignAccessToken = (jwtUtil.signAccessToken as any);

describe('Auth Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('given: valid registration credentials; when: registering guest user; then: user is created and token is returned', () => {
    it('should successfully register a new user with valid username and password', async () => {
      const input = { username: 'newuser', password: 'password123' };
      const hashedPassword = '$2b$10$hashedpassword';

      mockHashPassword.mockResolvedValue(hashedPassword);
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-1',
        username: 'newuser',
        passwordHash: hashedPassword,
        role: 'USER',
        teamId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockSignAccessToken.mockReturnValue('test-token');

      const result = await registerGuestUser(input);

      expect(result.user.username).toBe('newuser');
      expect(result.user.role).toBe('USER');
      expect(result.token).toBe('test-token');
      expect(mockHashPassword).toHaveBeenCalledWith('password123');
      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            username: 'newuser',
            role: 'USER',
          }),
        }),
      );
    });

    it('should normalize whitespace in username during registration', async () => {
      const input = { username: '  spaceduser  ', password: 'password123' };
      const hashedPassword = '$2b$10$hashedpassword';

      mockHashPassword.mockResolvedValue(hashedPassword);
      mockPrisma.user.findFirst.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-2',
        username: 'spaceduser',
        passwordHash: hashedPassword,
        role: 'USER',
        teamId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockSignAccessToken.mockReturnValue('test-token');

      await registerGuestUser(input);

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            username: 'spaceduser',
          }),
        }),
      );
    });
  });

  describe('given: duplicate username; when: registering; then: error is thrown', () => {
    it('should reject registration with existing username', async () => {
      const input = { username: 'existinguser', password: 'password123' };

      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'existing-user-1',
        username: 'existinguser',
        passwordHash: '$2b$10$hashedpassword',
        role: 'USER',
        teamId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(registerGuestUser(input)).rejects.toThrow(ValidationError);
      await expect(registerGuestUser(input)).rejects.toThrow('Username is already taken.');
    });

    it('should perform case-insensitive username check', async () => {
      const input = { username: 'ExistingUser', password: 'password123' };

      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'existing-user-2',
        username: 'existinguser',
        passwordHash: '$2b$10$hashedpassword',
        role: 'USER',
        teamId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(registerGuestUser(input)).rejects.toThrow('Username is already taken.');
    });
  });

  describe('given: role parameter in registration; when: not USER role; then: error is thrown', () => {
    it('should reject registration attempt with ADMIN role', async () => {
      const input = { username: 'newuser', password: 'password123', role: 'ADMIN' as any };

      await expect(registerGuestUser(input)).rejects.toThrow(ValidationError);
      await expect(registerGuestUser(input)).rejects.toThrow('Public registration can only create user accounts.');
    });

    it('should reject registration attempt with REFEREE role', async () => {
      const input = { username: 'newuser', password: 'password123', role: 'REFEREE' as any };

      await expect(registerGuestUser(input)).rejects.toThrow('Public registration can only create user accounts.');
    });
  });

  describe('given: valid login credentials; when: logging in; then: user is authenticated and token is returned', () => {
    it('should successfully login with correct username and password', async () => {
      const input = { username: 'testuser', password: 'correctpassword' };
      const hashedPassword = '$2b$10$hashedpassword';

      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-3',
        username: 'testuser',
        passwordHash: hashedPassword,
        role: 'USER',
        teamId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockComparePassword.mockResolvedValue(true);
      mockSignAccessToken.mockReturnValue('login-token');

      const result = await loginUser(input);

      expect(result.user.username).toBe('testuser');
      expect(result.token).toBe('login-token');
      expect(mockComparePassword).toHaveBeenCalledWith('correctpassword', hashedPassword);
    });

    it('should normalize whitespace in username during login', async () => {
      const input = { username: '  testuser  ', password: 'password' };

      mockPrisma.user.findFirst.mockResolvedValue({
        id: 'user-4',
        username: 'testuser',
        passwordHash: '$2b$10$hashedpassword',
        role: 'USER',
        teamId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockComparePassword.mockResolvedValue(true);
      mockSignAccessToken.mockReturnValue('login-token');

      await loginUser(input);

      expect(mockPrisma.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            username: expect.objectContaining({
              equals: 'testuser',
            }),
          }),
        }),
      );
    });

    it('should throw NotFoundError when user does not exist', async () => {
      const userId = 'nonexistent-user';

      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(getCurrentUser(userId)).rejects.toThrow(NotFoundError);
      await expect(getCurrentUser(userId)).rejects.toThrow('User was not found.');
    });
  });
});
