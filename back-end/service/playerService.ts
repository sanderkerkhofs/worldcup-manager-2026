import { prisma } from '../repository/prisma/client';
import { NotFoundError, ValidationError } from '../util/errors';
import { Player } from '../model/player';
import { PlayerCreateDto, PlayerUpdateDto } from '../types';

export async function listPlayers(teamId?: string) {
  const players = await prisma.player.findMany({
    where: teamId ? { teamId } : undefined,
    orderBy: [{ teamId: 'asc' }, { shirtNumber: 'asc' }],
  });

  return players.map((player) => Player.from(player));
}

export async function getPlayer(playerId: string) {
  const player = await prisma.player.findUnique({ where: { id: playerId } });

  if (!player) {
    throw new NotFoundError('Player was not found.');
  }

  return Player.from(player);
}

export async function createPlayer(input: PlayerCreateDto) {
  const team = await prisma.team.findUnique({ where: { id: input.teamId } });

  if (!team) {
    throw new NotFoundError('Team was not found.');
  }

  const existingPlayer = await prisma.player.findUnique({
    where: {
      teamId_shirtNumber: {
        teamId: input.teamId,
        shirtNumber: input.shirtNumber,
      },
    },
  });

  if (existingPlayer) {
    throw new ValidationError('Shirt number is already used in this team.');
  }

  const player = await prisma.player.create({
    data: {
      teamId: input.teamId,
      firstName: input.firstName,
      lastName: input.lastName,
      shirtNumber: input.shirtNumber,
      position: input.position,
    },
  });

  return Player.from(player);
}

export async function updatePlayer(playerId: string, input: PlayerUpdateDto) {
  const existingPlayer = await getPlayer(playerId);

  const player = await prisma.player.update({
    where: { id: playerId },
    data: {
      firstName: input.firstName ?? existingPlayer.firstName,
      lastName: input.lastName ?? existingPlayer.lastName,
      shirtNumber: input.shirtNumber ?? existingPlayer.shirtNumber,
      position: input.position ?? existingPlayer.position,
    },
  });

  return Player.from(player);
}

export async function deletePlayer(playerId: string) {
  await getPlayer(playerId);
  await prisma.player.delete({ where: { id: playerId } });
}
