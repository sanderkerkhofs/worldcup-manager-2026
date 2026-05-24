import { User as PrismaUser } from '@prisma/client';
import { ValidationError } from '../util/errors';
import { AuthUser, UserRole } from '../types';

const allowedRoles: UserRole[] = ['ADMIN', 'ORGANIZER', 'REFEREE', 'VIEWER'];

function validateRole(role: string): asserts role is UserRole {
    if (!allowedRoles.includes(role as UserRole)) {
        throw new ValidationError(`Unsupported user role: ${role}.`);
    }
}

export class User {
    public readonly id: string;
    public readonly username: string;
    public readonly passwordHash: string;
    public readonly role: UserRole;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    constructor({ id, username, passwordHash, role, createdAt, updatedAt }: {
        id: string;
        username: string;
        passwordHash: string;
        role: UserRole;
        createdAt?: Date;
        updatedAt?: Date;
    }) {
        if (!username.trim()) {
            throw new ValidationError('Username is required.');
        }

        if (!passwordHash.trim()) {
            throw new ValidationError('Password hash is required.');
        }

        validateRole(role);

        this.id = id;
        this.username = username.trim();
        this.passwordHash = passwordHash;
        this.role = role;
        this.createdAt = createdAt ?? new Date();
        this.updatedAt = updatedAt ?? new Date();
    }

    static from(prismaUser: PrismaUser): User {
        const role = prismaUser.role as unknown as string;
        validateRole(role);

        return new User({
            id: prismaUser.id,
            username: prismaUser.username,
            passwordHash: prismaUser.passwordHash,
            role,
            createdAt: prismaUser.createdAt,
            updatedAt: prismaUser.updatedAt,
        });
    }

    toAuthUser(): AuthUser {
        return {
            id: this.id,
            username: this.username,
            role: this.role,
        };
    }
}