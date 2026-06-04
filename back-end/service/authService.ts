import { prisma } from '../repository/prisma/client';
import { comparePassword, hashPassword } from '../util/password';
import { signAccessToken } from '../util/jwt';
import { ValidationError, NotFoundError, UnauthorizedError } from '../util/errors';
import { User } from '../model/user';
import { AuthUser, LoginDto, RegisterDto } from '../types';

function toPublicUser(user: User): AuthUser {
  return {
    username: user.username,
    role: user.role,
    teamName: user.teamName,
  };
}

function toAuthResponse(user: User) {
  const token = signAccessToken({
    username: user.username,
    role: user.role,
    teamName: user.teamName,
  });

  return { user: toPublicUser(user), token };
}

export async function registerGuestUser(input: RegisterDto) {
  if (input.role && input.role !== 'USER') {
    throw new ValidationError('Public registration can only create user accounts.');
  }

  const normalizedUsername = input.username.trim();

  const existingUser = await prisma.user.findFirst({
    where: {
      username: {
        equals: normalizedUsername,
        mode: 'insensitive',
      },
    },
  });

  if (existingUser) {
    throw new ValidationError('Username is already taken.');
  }

  const user = await prisma.user.create({
    data: {
      username: normalizedUsername,
      passwordHash: await hashPassword(input.password),
      role: 'USER',
    },
  });

  return toAuthResponse(User.from(user));
}

export async function loginUser(input: LoginDto) {
  const normalizedUsername = input.username.trim();

  const user = await prisma.user.findFirst({
    where: {
      username: {
        equals: normalizedUsername,
        mode: 'insensitive',
      },
    },
  });

  if (!user) {
    throw new UnauthorizedError('Invalid username or password.');
  }

  const isPasswordValid = await comparePassword(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid username or password.');
  }

  return toAuthResponse(User.from(user));
}

export async function getCurrentUser(username: string) {
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    throw new NotFoundError('User was not found.');
  }

  return toPublicUser(User.from(user));
}
