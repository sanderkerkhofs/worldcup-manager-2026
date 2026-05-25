import { User as PrismaUser } from '@prisma/client';
import { UserRole } from '../types';
import { ValidationError } from '../util/errors';

function isUserRole(role: string): role is UserRole {
  return role === 'ADMIN' || role === 'REFEREE' || role === 'GUEST';
}

export class User {
  public readonly id: string;
  public readonly username: string;
  public readonly passwordHash: string;
  public readonly role: UserRole;
  public readonly countryShortName: string | null;
  public readonly teamId: string | null;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor({
    id,
    username,
    passwordHash,
    role,
    countryShortName = null,
    teamId = null,
    createdAt,
    updatedAt,
  }: {
    id: string;
    username: string;
    passwordHash: string;
    role: UserRole;
    countryShortName?: string | null;
    teamId?: string | null;
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

    this.id = id;
    this.username = username;
    this.passwordHash = passwordHash;
    this.role = role;
    this.countryShortName = countryShortName;
    this.teamId = teamId;
    this.createdAt = createdAt ?? new Date();
    this.updatedAt = updatedAt ?? new Date();
  }

  static from(prismaUser: PrismaUser): User {
    const role = prismaUser.role as unknown as string;

    if (!isUserRole(role)) {
      throw new ValidationError('User role is invalid.');
    }

    return new User({
      id: prismaUser.id,
      username: prismaUser.username,
      passwordHash: prismaUser.passwordHash,
      role,
      countryShortName: prismaUser.countryShortName,
      teamId: prismaUser.teamId,
      createdAt: prismaUser.createdAt,
      updatedAt: prismaUser.updatedAt,
    });
  }
}
