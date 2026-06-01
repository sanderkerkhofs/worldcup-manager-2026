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
          id: 'user-1',
          username: 'admin_user',
          passwordHash: '$2b$10$hash1',
          role: 'ADMIN',
          teamId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user-2',
          username: 'referee_john',
          passwordHash: '$2b$10$hash2',
          role: 'REFEREE',
          teamId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user-3',
          username: 'regular_user',
          passwordHash: '$2b$10$hash3',
          role: 'USER',
          teamId: 'team-1',
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
          id: 'user-4',
          username: 'testuser',
          passwordHash: '$2b$10$secret_hash',
          role: 'USER',
          teamId: null,
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
          id: 'user-5',
          username: 'admin1',
          passwordHash: '$2b$10$hash',
          role: 'ADMIN',
          teamId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user-6',
          username: 'ref1',
          passwordHash: '$2b$10$hash',
          role: 'REFEREE',
          teamId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user-7',
          username: 'user1',
          passwordHash: '$2b$10$hash',
          role: 'USER',
          teamId: 'team-1',
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

  describe('given: valid userId different from actor; when: deleting user; then: user is deleted successfully', () => {
    it('should delete user when actor is different from target user', async () => {
      const userId = 'user-to-delete';
      const actorId = 'actor-user';

      mockPrisma.user.findUnique.mockResolvedValue({
        id: userId,
        username: 'user_to_delete',
        passwordHash: '$2b$10$hash',
        role: 'USER',
        teamId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockPrisma.user.delete.mockResolvedValue({
        id: userId,
        username: 'user_to_delete',
        passwordHash: '$2b$10$hash',
        role: 'USER',
        teamId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(deleteUserForAdmin(userId, actorId)).resolves.not.toThrow();
      expect(mockPrisma.user.delete).toHaveBeenCalledWith({ where: { id: userId } });
    });

    it('should delete any user role', async () => {
      const roles = ['ADMIN', 'REFEREE', 'USER'] as const;

      for (const role of roles) {
        jest.clearAllMocks();
        const userId = `user-${role}`;
        const actorId = 'actor-user';

        mockPrisma.user.findUnique.mockResolvedValue({
          id: userId,
          username: `user_${role.toLowerCase()}`,
          passwordHash: '$2b$10$hash',
          role,
          teamId: role === 'USER' ? 'team-1' : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        mockPrisma.user.delete.mockResolvedValue({
          id: userId,
          username: `user_${role.toLowerCase()}`,
          passwordHash: '$2b$10$hash',
          role,
          teamId: role === 'USER' ? 'team-1' : null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await expect(deleteUserForAdmin(userId, actorId)).resolves.not.toThrow();
      }
    });
  });

  describe('given: userId same as actorId; when: deleting user; then: error is thrown', () => {
    it('should reject when user tries to delete own account', async () => {
      const userId = 'same-user-id';
      const actorId = 'same-user-id';

      await expect(deleteUserForAdmin(userId, actorId)).rejects.toThrow(ValidationError);
      await expect(deleteUserForAdmin(userId, actorId)).rejects.toThrow(
        'You cannot delete your own account.',
      );
      expect(mockPrisma.user.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('given: non-existent userId; when: deleting user; then: error is thrown', () => {
    it('should throw NotFoundError when user does not exist', async () => {
      const userId = 'nonexistent-user';
      const actorId = 'actor-user';

      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(deleteUserForAdmin(userId, actorId)).rejects.toThrow(NotFoundError);
      await expect(deleteUserForAdmin(userId, actorId)).rejects.toThrow('User was not found.');
    });
  });

  describe('given: admin deleting another admin; when: deleting user; then: deletion succeeds', () => {
    it('should allow admin to delete another admin', async () => {
      const userId = 'other-admin';
      const actorId = 'deleting-admin';

      mockPrisma.user.findUnique.mockResolvedValue({
        id: userId,
        username: 'other_admin',
        passwordHash: '$2b$10$hash',
        role: 'ADMIN',
        teamId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      mockPrisma.user.delete.mockResolvedValue({
        id: userId,
        username: 'other_admin',
        passwordHash: '$2b$10$hash',
        role: 'ADMIN',
        teamId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(deleteUserForAdmin(userId, actorId)).resolves.not.toThrow();
    });
  });

  describe('given: multiple users; when: listing users in sequence; then: proper deletion occurs', () => {
    it('should handle multiple delete operations correctly', async () => {
      const userToDelete1 = 'user-delete-1';
      const userToDelete2 = 'user-delete-2';
      const actorId = 'actor';

      for (const userId of [userToDelete1, userToDelete2]) {
        jest.clearAllMocks();

        mockPrisma.user.findUnique.mockResolvedValue({
          id: userId,
          username: `user_${userId}`,
          passwordHash: '$2b$10$hash',
          role: 'USER',
          teamId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        mockPrisma.user.delete.mockResolvedValue({
          id: userId,
          username: `user_${userId}`,
          passwordHash: '$2b$10$hash',
          role: 'USER',
          teamId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        await expect(deleteUserForAdmin(userId, actorId)).resolves.not.toThrow();
      }
    });
  });

  describe('given: user with team assignment; when: listing users; then: teamId is preserved', () => {
    it('should return user teamId information', async () => {
      const mockUsers = [
        {
          id: 'user-with-team',
          username: 'team_coach',
          passwordHash: '$2b$10$hash',
          role: 'USER',
          teamId: 'team-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await listUsersForAdmin();

      expect(result[0].teamId).toBe('team-1');
    });

    it('should handle null teamId correctly', async () => {
      const mockUsers = [
        {
          id: 'user-no-team',
          username: 'free_user',
          passwordHash: '$2b$10$hash',
          role: 'ADMIN',
          teamId: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockPrisma.user.findMany.mockResolvedValue(mockUsers);

      const result = await listUsersForAdmin();

      expect(result[0].teamId).toBeNull();
    });
  });
});
