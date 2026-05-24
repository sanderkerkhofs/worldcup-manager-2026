import { prisma } from '../repository/prisma/client';
import { User } from '../model/user';
import { AuthUser } from '../types';
import { NotFoundError, ValidationError } from '../util/errors';
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

export async function listUsersForAdmin() {
  const users = await prisma.user.findMany({ orderBy: { username: 'asc' } });
  return users.map((user) => toPublicUser(User.from(user)));
}

export async function deleteUserForAdmin(userId: string, actorId: string) {
  if (userId === actorId) {
    throw new ValidationError('You cannot delete your own account.');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new NotFoundError('User was not found.');
  }

  await prisma.user.delete({ where: { id: userId } });
}
