import { User as PrismaUser } from '@prisma/client';
import { UserRole } from '../types';
import { ValidationError } from '../util/errors';

function isUserRole(role: string): role is UserRole {
  return role === 'ADMIN' || role === 'REFEREE' || role === 'USER' || role === 'GUEST';
}

export class User {
  public readonly username: string;
  public readonly passwordHash: string;
  public readonly role: UserRole;
  public readonly teamName: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor({
    username,
    passwordHash,
    role,
    teamName = null,
    createdAt,
    updatedAt,
  }: {
    username: string;
    passwordHash: string;
    role: UserRole;
    teamName?: string | null;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    if (!username.trim()) {
      throw new ValidationError('Username is required.');
    }

    if (!passwordHash.trim()) {
      throw new ValidationError('Password hash is required.');
    }

    if (!isUserRole(role)) {
      throw new ValidationError('User role is invalid.');
    }

    this.username = username;
    this.passwordHash = passwordHash;
    this.role = role;
    this.teamName = teamName;
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }

  static from(prismaUser: PrismaUser): User {
    const role = prismaUser.role as unknown as string;

    if (!isUserRole(role)) {
      throw new ValidationError('User role is invalid.');
    }

    return new User({
      username: prismaUser.username,
      passwordHash: prismaUser.passwordHash,
      role,
      teamName: prismaUser.teamName,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }
}
