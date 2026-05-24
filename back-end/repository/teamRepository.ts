import { prisma } from './prisma/client';
import { Team } from '../model/team';

export async function listTeams(): Promise<Team[]> {
    const teams = await prisma.team.findMany({
        orderBy: { name: 'asc' },
    });

    return teams.map((team) => Team.from(team));
}

export async function findTeamById(id: string): Promise<Team | null> {
    const team = await prisma.team.findUnique({
        where: { id },
    });

    return team ? Team.from(team) : null;
}

export async function findTeamByName(name: string): Promise<Team | null> {
    const team = await prisma.team.findUnique({
        where: { name },
    });

    return team ? Team.from(team) : null;
}

export async function createTeam(input: { name: string; country: string; coach: string; }): Promise<Team> {
    const team = await prisma.team.create({
        data: input,
    });

    return Team.from(team);
}

export async function deleteTeam(id: string): Promise<void> {
    await prisma.team.delete({
        where: { id },
    });
}