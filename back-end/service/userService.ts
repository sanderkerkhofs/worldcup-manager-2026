import { prisma } from '../repository/prisma/client';
import { User } from '../model/user';
import { AuthUser } from '../types';
import { NotFoundError, ValidationError } from '../util/errors';

function toPublicUser(user: User): AuthUser {
  return {
    username: user.username,
    role: user.role,
    teamName: user.teamName,
  };
}

export async function listUsersForAdmin() {
  const users = await prisma.user.findMany({ orderBy: { username: 'asc' } });
  return users.map((user) => toPublicUser(User.from(user)));
}

export async function deleteUserForAdmin(username: string, actorUsername: string) {
  if (username === actorUsername) {
    throw new ValidationError('You cannot delete your own account.');
  }

  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    throw new NotFoundError('User was not found.');
  }

  await prisma.user.delete({ where: { username } });
}
