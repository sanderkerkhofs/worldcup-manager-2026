import { UserRole } from '@prisma/client';
import { prisma } from './prisma/client';
import { User } from '../model/user';

export async function findUserByUsername(username: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
        where: { username },
    });

    return user ? User.from(user) : null;
}

export async function findUserById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
        where: { id },
    });

    return user ? User.from(user) : null;
}

export async function createUser(input: {
    username: string;
    passwordHash: string;
    role: UserRole;
}): Promise<User> {
    const user = await prisma.user.create({
        data: input,
    });

    return User.from(user);
}

export async function listUsers(): Promise<User[]> {
    const users = await prisma.user.findMany({
        orderBy: { username: 'asc' },
    });

    return users.map((user) => User.from(user));
}