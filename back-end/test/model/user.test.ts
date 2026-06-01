import { User } from '../../model/user';
import { ValidationError } from '../../util/errors';

describe('User domain model', () => {
  describe('given: valid user data; when: creating a user; then: user is created successfully', () => {
    it('should create a user with all valid fields', () => {
      const user = new User({
        id: 'user-1',
        username: 'john_doe',
        passwordHash: '$2b$10$hashedpassword',
        role: 'USER',
        teamId: null,
      });

      expect(user.id).toBe('user-1');
      expect(user.username).toBe('john_doe');
      expect(user.passwordHash).toBe('$2b$10$hashedpassword');
      expect(user.role).toBe('USER');
      expect(user.teamId).toBeNull();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('should create admin user with role ADMIN', () => {
      const user = new User({
        id: 'admin-1',
        username: 'admin_user',
        passwordHash: '$2b$10$hashedpassword',
        role: 'ADMIN',
      });

      expect(user.role).toBe('ADMIN');
    });

    it('should create referee user with role REFEREE', () => {
      const user = new User({
        id: 'ref-1',
        username: 'referee_john',
        passwordHash: '$2b$10$hashedpassword',
        role: 'REFEREE',
      });

      expect(user.role).toBe('REFEREE');
    });

    it('should create user assigned to a team', () => {
      const user = new User({
        id: 'user-2',
        username: 'team_coach',
        passwordHash: '$2b$10$hashedpassword',
        role: 'USER',
        teamId: 'team-1',
      });

      expect(user.teamId).toBe('team-1');
    });

    it('should auto-generate timestamps when not provided', () => {
      const before = new Date();
      const user = new User({
        id: 'user-3',
        username: 'new_user',
        passwordHash: '$2b$10$hashedpassword',
        role: 'USER',
      });
      const after = new Date();

      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(after.getTime());
      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(user.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime());
    });

    it('should use provided timestamps', () => {
      const createdAt = new Date('2026-01-01T00:00:00Z');
      const updatedAt = new Date('2026-02-01T00:00:00Z');
      const user = new User({
        id: 'user-4',
        username: 'historical_user',
        passwordHash: '$2b$10$hashedpassword',
        role: 'USER',
        createdAt,
        updatedAt,
      });

      expect(user.createdAt).toEqual(createdAt);
      expect(user.updatedAt).toEqual(updatedAt);
    });
  });

  describe('given: invalid username; when: creating user; then: error is thrown', () => {
    it('should reject empty username', () => {
      expect(() => new User({
        id: 'user-5',
        username: '',
        passwordHash: '$2b$10$hashedpassword',
        role: 'USER',
      })).toThrow(ValidationError);
      expect(() => new User({
        id: 'user-5',
        username: '',
        passwordHash: '$2b$10$hashedpassword',
        role: 'USER',
      })).toThrow('Username is required.');
    });

    it('should reject whitespace-only username', () => {
      expect(() => new User({
        id: 'user-6',
        username: '   ',
        passwordHash: '$2b$10$hashedpassword',
        role: 'USER',
      })).toThrow('Username is required.');
    });

    it('should reject tab and newline characters in username', () => {
      expect(() => new User({
        id: 'user-7',
        username: '\t\n',
        passwordHash: '$2b$10$hashedpassword',
        role: 'USER',
      })).toThrow('Username is required.');
    });
  });

  describe('given: invalid password hash; when: creating user; then: error is thrown', () => {
    it('should reject empty password hash', () => {
      expect(() => new User({
        id: 'user-8',
        username: 'testuser',
        passwordHash: '',
        role: 'USER',
      })).toThrow(ValidationError);
      expect(() => new User({
        id: 'user-8',
        username: 'testuser',
        passwordHash: '',
        role: 'USER',
      })).toThrow('Password hash is required.');
    });

    it('should reject whitespace-only password hash', () => {
      expect(() => new User({
        id: 'user-9',
        username: 'testuser',
        passwordHash: '   ',
        role: 'USER',
      })).toThrow('Password hash is required.');
    });
  });

  describe('given: invalid role; when: creating user; then: error is thrown', () => {
    it('should reject invalid role string', () => {
      expect(() => new User({
        id: 'user-10',
        username: 'testuser',
        passwordHash: '$2b$10$hashedpassword',
        role: 'INVALID_ROLE' as any,
      })).toThrow('User role is invalid.');
    });

    it('should reject lowercase role strings', () => {
      expect(() => new User({
        id: 'user-11',
        username: 'testuser',
        passwordHash: '$2b$10$hashedpassword',
        role: 'admin' as any,
      })).toThrow('User role is invalid.');
    });

    it('should reject null role', () => {
      expect(() => new User({
        id: 'user-12',
        username: 'testuser',
        passwordHash: '$2b$10$hashedpassword',
        role: null as any,
      })).toThrow('User role is invalid.');
    });
  });

  describe('given: valid role values; when: creating user with each role; then: all roles are accepted', () => {
    it('should accept ADMIN role', () => {
      const user = new User({
        id: 'user-13',
        username: 'admin',
        passwordHash: '$2b$10$hashedpassword',
        role: 'ADMIN',
      });
      expect(user.role).toBe('ADMIN');
    });

    it('should accept REFEREE role', () => {
      const user = new User({
        id: 'user-14',
        username: 'referee',
        passwordHash: '$2b$10$hashedpassword',
        role: 'REFEREE',
      });
      expect(user.role).toBe('REFEREE');
    });

    it('should accept USER role', () => {
      const user = new User({
        id: 'user-15',
        username: 'user',
        passwordHash: '$2b$10$hashedpassword',
        role: 'USER',
      });
      expect(user.role).toBe('USER');
    });

    it('should accept GUEST role', () => {
      const user = new User({
        id: 'user-16',
        username: 'guest',
        passwordHash: '$2b$10$hashedpassword',
        role: 'GUEST',
      });
      expect(user.role).toBe('GUEST');
    });
  });

  describe('given: prisma user object; when: converting to User; then: user is created from prisma data', () => {
    it('should create User from Prisma user object', () => {
      const prismaUser = {
        id: 'user-17',
        username: 'prisma_user',
        passwordHash: '$2b$10$hashedpassword',
        role: 'USER' as const,
        teamId: 'team-1',
        createdAt: new Date('2026-01-01T00:00:00Z'),
        updatedAt: new Date('2026-01-02T00:00:00Z'),
      };

      const user = User.from(prismaUser);

      expect(user.id).toBe('user-17');
      expect(user.username).toBe('prisma_user');
      expect(user.passwordHash).toBe('$2b$10$hashedpassword');
      expect(user.role).toBe('USER');
      expect(user.teamId).toBe('team-1');
      expect(user.createdAt).toEqual(prismaUser.createdAt);
      expect(user.updatedAt).toEqual(prismaUser.updatedAt);
    });

    it('should handle Prisma user with null teamId', () => {
      const prismaUser = {
        id: 'user-18',
        username: 'no_team_user',
        passwordHash: '$2b$10$hashedpassword',
        role: 'ADMIN' as const,
        teamId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const user = User.from(prismaUser);

      expect(user.teamId).toBeNull();
    });

    it('should reject Prisma user with invalid role', () => {
      const prismaUser = {
        id: 'user-19',
        username: 'invalid_role_user',
        passwordHash: '$2b$10$hashedpassword',
        role: 'INVALID_ROLE',
        teamId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(() => User.from(prismaUser as any)).toThrow('User role is invalid.');
    });
  });

  describe('given: user properties; when: checking if properties are accessible; then: properties are properly set', () => {
    it('should have properties properly initialized', () => {
      const user = new User({
        id: 'user-20',
        username: 'readonly_user',
        passwordHash: '$2b$10$hashedpassword',
        role: 'USER',
      });

      expect(user.id).toBe('user-20');
      expect(user.username).toBe('readonly_user');
      expect(user.role).toBe('USER');
    });
  });
});
