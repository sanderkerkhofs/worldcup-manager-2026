import { listUsersForAdmin, deleteUserForAdmin } from '../../service/userService';
import { NotFoundError, ValidationError } from '../../util/errors';

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

import { prisma } from '../../repository/prisma/client';

const mockPrisma = (prisma as any);

describe('User Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('given: users in database; when: listing users for admin; then: all users are returned sorted by username', () => {
    it('should return all users ordered by username ascending', async () => {
      const mockUsers = [
        {
          username: 'admin_user',
          passwordHash: '$2b$10$hash1',
          role: 'ADMIN',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          username: 'referee_john',
          passwordHash: '$2b$10$hash2',
          role: 'REFEREE',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          username: 'regular_user',
          passwordHash: '$2b$10$hash3',
          role: 'USER',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await listUsersForAdmin();

      expect(result).toHaveLength(3);
      expect(result[0].username).toBe('admin_user');
      expect(result[1].username).toBe('referee_john');
      expect(result[2].username).toBe('regular_user');
      expect(mockPrisma.user.findMany).toHaveBeenCalledWith({ orderBy: { username: 'asc' } });
    });

    it('should return users without password hashes', async () => {
      const mockUsers = [
        {
          username: 'testuser',
          passwordHash: '$2b$10$secret_hash',
          role: 'USER',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await listUsersForAdmin();

      expect(result[0]).not.toHaveProperty('passwordHash');
      expect(result[0].username).toBe('testuser');
      expect(result[0].role).toBe('USER');
    });

    it('should return empty array when no users exist', async () => {
      mockPrisma.user.findMany.mockResolvedValue([]);

      const result = await listUsersForAdmin();

      expect(result).toHaveLength(0);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should return users with various roles', async () => {
      const mockUsers = [
        {
          username: 'admin1',
          passwordHash: '$2b$10$hash',
          role: 'ADMIN',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          username: 'ref1',
          passwordHash: '$2b$10$hash',
          role: 'REFEREE',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          username: 'user1',
          passwordHash: '$2b$10$hash',
          role: 'USER',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await listUsersForAdmin();

      expect(result[0].role).toBe('ADMIN');
      expect(result[1].role).toBe('REFEREE');
      expect(result[2].role).toBe('USER');
    });
  });

  describe('given: valid username different from actor; when: deleting user; then: user is deleted successfully', () => {
    it('should delete user when actor is different from target user', async () => {
      const username = 'user_to_delete';
      const actorUsername = 'actor_user';

      mockPrisma.user.findUnique.mockResolvedValue({
        username: username,
        passwordHash: '$2b$10$hash',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockPrisma.user.delete.mockResolvedValue({
        username: username,
        passwordHash: '$2b$10$hash',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(deleteUserForAdmin(username, actorUsername)).resolves.not.toThrow();
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { username: username } });
    });

    it('should delete any user role', async () => {
      const roles = ['ADMIN', 'REFEREE', 'USER'] as const;

      for (const role of roles) {
        jest.clearAllMocks();
        const username = `user_${role.toLowerCase()}`;
        const actorUsername = 'actor_user';

        mockPrisma.user.findUnique.mockResolvedValue({
          username: username,
          passwordHash: '$2b$10$hash',
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        mockPrisma.user.delete.mockResolvedValue({
          username: username,
          passwordHash: '$2b$10$hash',
          role,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await expect(deleteUserForAdmin(username, actorUsername)).resolves.not.toThrow();
      }
    });
  });

  describe('given: username same as actorUsername; when: deleting user; then: error is thrown', () => {
    it('should reject when user tries to delete own account', async () => {
      const username = 'same_user';
      const actorUsername = 'same_user';

      await expect(deleteUserForAdmin(username, actorUsername)).rejects.toThrow(ValidationError);
      await expect(deleteUserForAdmin(username, actorUsername)).rejects.toThrow(
        'You cannot delete your own account.',
      );
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('given: non-existent username; when: deleting user; then: error is thrown', () => {
    it('should throw NotFoundError when user does not exist', async () => {
      const username = 'nonexistent_user';
      const actorUsername = 'actor_user';

      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(deleteUserForAdmin(username, actorUsername)).rejects.toThrow(NotFoundError);
      await expect(deleteUserForAdmin(username, actorUsername)).rejects.toThrow('User was not found.');
    });
  });

  describe('given: admin deleting another admin; when: deleting user; then: deletion succeeds', () => {
    it('should allow admin to delete another admin', async () => {
      const username = 'other_admin';
      const actorUsername = 'deleting_admin';

      mockPrisma.user.findUnique.mockResolvedValue({
        username: username,
        passwordHash: '$2b$10$hash',
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockPrisma.user.delete.mockResolvedValue({
        username: username,
        passwordHash: '$2b$10$hash',
        role: 'ADMIN',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(deleteUserForAdmin(username, actorUsername)).resolves.not.toThrow();
    });
  });

  describe('given: multiple users; when: listing users in sequence; then: proper deletion occurs', () => {
    it('should handle multiple delete operations correctly', async () => {
      const userToDelete1 = 'user_delete_1';
      const userToDelete2 = 'user_delete_2';
      const actorUsername = 'actor';

      for (const username of [userToDelete1, userToDelete2]) {
        jest.clearAllMocks();

        mockPrisma.user.findUnique.mockResolvedValue({
          username: username,
          passwordHash: '$2b$10$hash',
          role: 'USER',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        mockPrisma.user.delete.mockResolvedValue({
          username: username,
          passwordHash: '$2b$10$hash',
          role: 'USER',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await expect(deleteUserForAdmin(username, actorUsername)).resolves.not.toThrow();
      }
    });
  });
});
