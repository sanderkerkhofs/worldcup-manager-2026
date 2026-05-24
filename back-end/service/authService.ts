import { prisma } from '../repository/prisma/client';
import { comparePassword, hashPassword } from '../util/password';
import { signAccessToken } from '../util/jwt';
import { ValidationError, NotFoundError, UnauthorizedError } from '../util/errors';
import { User } from '../model/user';
import { AuthUser, LoginDto, RegisterDto } from '../types';
import { getCountryFlagFromShortName } from '../util/country';

function toPublicUser(user: User): AuthUser {
  return {
    id: user.id,
    username: user.username,
    role: user.role,
    countryShortName: user.countryShortName,
    countryFlag: getCountryFlagFromShortName(user.countryShortName),
    teamId: user.teamId,
  };
}

function toAuthResponse(user: User) {
  const token = signAccessToken({
    sub: user.id,
    username: user.username,
    role: user.role,
    teamId: user.teamId,
  });

  return { user: toPublicUser(user), token };
}

export async function registerGuestUser(input: RegisterDto) {
  if (input.role && input.role !== 'GUEST') {
    throw new ValidationError('Public registration can only create guest accounts.');
  }

  const existingUser = await prisma.user.findUnique({ where: { username: input.username } });

  if (existingUser) {
    throw new ValidationError('Username is already taken.');
  }

  const user = await prisma.user.create({
    data: {
      username: input.username.trim(),
      passwordHash: await hashPassword(input.password),
      role: 'GUEST',
    },
  });

  return toAuthResponse(User.from(user));
}

export async function loginUser(input: LoginDto) {
  const user = await prisma.user.findUnique({ where: { username: input.username } });

  if (!user) {
    throw new UnauthorizedError('Invalid username or password.');
  }

  const isPasswordValid = await comparePassword(input.password, user.passwordHash);

  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid username or password.');
  }

  return toAuthResponse(User.from(user));
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new NotFoundError('User was not found.');
  }

  return toPublicUser(User.from(user));
}
