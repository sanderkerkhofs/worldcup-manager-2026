import { prisma } from '../repository/prisma/client';
import { ValidationError, NotFoundError } from '../util/errors';
import { Team } from '../model/team';
import { Player } from '../model/player';
import { TeamCreateDto, TeamUpdateDto } from '../types';

export async function listTeams() {
  const teams = await prisma.team.findMany({ orderBy: { name: 'asc' } });
  return teams.map((team) => Team.from(team));
}

export async function getTeam(teamId: string) {
  const team = await prisma.team.findUnique({ where: { id: teamId } });

  if (!team) {
    throw new NotFoundError('Team was not found.');
  }

  return Team.from(team);
}

export async function createTeam(input: TeamCreateDto) {
  const existingTeam = await prisma.team.findUnique({ where: { name: input.name } });

  if (existingTeam) {
    throw new ValidationError('Team name is already in use.');
  }

  const team = await prisma.team.create({ data: input });
  return Team.from(team);
}

export async function updateTeam(teamId: string, input: TeamUpdateDto) {
  await getTeam(teamId);
  const team = await prisma.team.update({ where: { id: teamId }, data: input });
  return Team.from(team);
}

export async function deleteTeam(teamId: string) {
  await getTeam(teamId);
  await prisma.team.delete({ where: { id: teamId } });
}

export async function listTeamPlayers(teamId: string) {
  await getTeam(teamId);

  const players = await prisma.player.findMany({
    where: { teamId },
    orderBy: [{ shirtNumber: 'asc' }],
  });

  return players.map((player) => Player.from(player));
}
