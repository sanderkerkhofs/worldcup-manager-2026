import { UserRole as PrismaUserRole } from '@prisma/client';
import { comparePassword, hashPassword } from '../util/password';
import { signAccessToken } from '../util/jwt';
import { ValidationError, UnauthorizedError } from '../util/errors';
import { AuthUser, LoginDto, RegisterDto } from '../types';
import { createUser, findUserByUsername } from '../repository/userRepository';

function normalizeRole(role?: string): PrismaUserRole {
    if (!role) {
        return PrismaUserRole.VIEWER;
    }

    if (role === 'ADMIN' || role === 'ORGANIZER' || role === 'REFEREE' || role === 'VIEWER') {
        return role as PrismaUserRole;
    }

    throw new ValidationError(`Unsupported role: ${role}.`);
}

export async function registerUser(input: RegisterDto): Promise<{ user: AuthUser; token: string; }> {
    if (input.username.trim().length < 3) {
        throw new ValidationError('Username must contain at least 3 characters.');
    }

    if (input.password.length < 6) {
        throw new ValidationError('Password must contain at least 6 characters.');
    }

    const existingUser = await findUserByUsername(input.username.trim());

    if (existingUser) {
        throw new ValidationError('A user with this username already exists.');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await createUser({
        username: input.username.trim(),
        passwordHash,
        role: normalizeRole(input.role),
    });

    const authUser = user.toAuthUser();
    const token = signAccessToken({
        sub: authUser.id,
        username: authUser.username,
        role: authUser.role,
    });

    return { user: authUser, token };
}

export async function loginUser(input: LoginDto): Promise<{ user: AuthUser; token: string; }> {
    const user = await findUserByUsername(input.username.trim());

    if (!user) {
        throw new UnauthorizedError('Incorrect username or password.');
    }

    const passwordMatches = await comparePassword(input.password, user.passwordHash);

    if (!passwordMatches) {
        throw new UnauthorizedError('Incorrect username or password.');
    }

    const authUser = user.toAuthUser();
    const token = signAccessToken({
        sub: authUser.id,
        username: authUser.username,
        role: authUser.role,
    });

    return { user: authUser, token };
}