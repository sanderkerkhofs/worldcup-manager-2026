import { prisma } from './prisma/client';
import { Tournament } from '../model/tournament';
import { Round } from '../model/round';
import { Match } from '../model/match';
import { Team } from '../model/team';
import type { MatchStatus, TournamentCreateDto, TournamentUpdateDto } from '../types';

export async function listTournaments(): Promise<Tournament[]> {
    const tournaments = await prisma.tournament.findMany({
        orderBy: { createdAt: 'desc' },
    });

    return tournaments.map((tournament) => Tournament.from(tournament));
}

export async function findTournamentById(id: string): Promise<Tournament | null> {
    const tournament = await prisma.tournament.findUnique({
        where: { id },
    });

    return tournament ? Tournament.from(tournament) : null;
}

export async function createTournament(input: TournamentCreateDto): Promise<Tournament> {
    const tournament = await prisma.tournament.create({
        data: input,
    });

    return Tournament.from(tournament);
}

export async function updateTournament(id: string, input: TournamentUpdateDto): Promise<Tournament> {
    const tournament = await prisma.tournament.update({
        where: { id },
        data: input,
    });

    return Tournament.from(tournament);
}

export async function deleteTournament(id: string): Promise<void> {
    await prisma.tournament.delete({
        where: { id },
    });
}

export async function listTournamentTeams(tournamentId: string): Promise<Team[]> {
    const registrations = await prisma.tournamentTeam.findMany({
        where: { tournamentId },
        include: { team: true },
        orderBy: { registeredAt: 'asc' },
    });

    return registrations.map((registration) => Team.from(registration.team));
}

export async function registerTeam(tournamentId: string, teamId: string): Promise<void> {
    await prisma.tournamentTeam.create({
        data: {
            tournamentId,
            teamId,
        },
    });
}

export async function unregisterTeam(tournamentId: string, teamId: string): Promise<void> {
    await prisma.tournamentTeam.delete({
        where: {
            tournamentId_teamId: {
                tournamentId,
                teamId,
            },
        },
    });
}

export async function listRounds(tournamentId: string): Promise<Round[]> {
    const rounds = await prisma.round.findMany({
        where: { tournamentId },
        orderBy: { orderNumber: 'asc' },
    });

    return rounds.map((round) => Round.from(round));
}

export async function createRound(input: { tournamentId: string; name: string; orderNumber: number; }): Promise<Round> {
    const round = await prisma.round.create({
        data: input,
    });

    return Round.from(round);
}

export async function findRoundById(id: string): Promise<Round | null> {
    const round = await prisma.round.findUnique({
        where: { id },
    });

    return round ? Round.from(round) : null;
}

export async function listMatchesByTournament(tournamentId: string): Promise<Match[]> {
    const matches = await prisma.match.findMany({
        where: { tournamentId },
        orderBy: { matchDate: 'asc' },
    });

    return matches.map((match) => Match.from(match));
}

export async function findMatchById(id: string): Promise<Match | null> {
    const match = await prisma.match.findUnique({
        where: { id },
    });

    return match ? Match.from(match) : null;
}

export async function createMatch(input: {
    tournamentId: string;
    roundId: string;
    homeTeamId: string;
    awayTeamId: string;
    matchDate: Date;
    refereeId?: string;
}): Promise<Match> {
    const match = await prisma.match.create({
        data: {
            ...input,
            status: 'SCHEDULED',
        },
    });

    return Match.from(match);
}

export async function updateMatchResult(id: string, input: {
    homeScore: number;
    awayScore: number;
    status: MatchStatus;
}): Promise<Match> {
    const match = await prisma.match.update({
        where: { id },
        data: input,
    });

    return Match.from(match);
}