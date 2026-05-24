import { ForbiddenError, NotFoundError, ValidationError } from '../util/errors';
import {
    MatchCreateDto,
    MatchResultDto,
    RoundCreateDto,
    StandingsRow,
    TournamentCreateDto,
    TournamentUpdateDto,
} from '../types';
import { Tournament } from '../model/tournament';
import { Team } from '../model/team';
import { Round } from '../model/round';
import { Match } from '../model/match';
import {
    createMatch,
    createRound,
    createTournament,
    deleteTournament,
    findMatchById,
    findRoundById,
    findTournamentById,
    listMatchesByTournament,
    listRounds,
    listTournamentTeams,
    listTournaments,
    registerTeam,
    unregisterTeam,
    updateMatchResult,
    updateTournament,
} from '../repository/tournamentRepository';
import { findTeamById } from '../repository/teamRepository';

export async function getAllTournaments(): Promise<Tournament[]> {
    return listTournaments();
}

export async function getTournament(tournamentId: string): Promise<Tournament> {
    const tournament = await findTournamentById(tournamentId);

    if (!tournament) {
        throw new NotFoundError('Tournament not found.');
    }

    return tournament;
}

export async function createTournamentUseCase(input: TournamentCreateDto): Promise<Tournament> {
    return createTournament(input);
}

export async function updateTournamentUseCase(tournamentId: string, input: TournamentUpdateDto): Promise<Tournament> {
    await getTournament(tournamentId);
    return updateTournament(tournamentId, input);
}

export async function deleteTournamentUseCase(tournamentId: string): Promise<void> {
    await getTournament(tournamentId);
    await deleteTournament(tournamentId);
}

export async function addTeamToTournament(tournamentId: string, teamId: string): Promise<void> {
    await getTournament(tournamentId);

    const team = await findTeamById(teamId);

    if (!team) {
        throw new NotFoundError('Team not found.');
    }

    await registerTeam(tournamentId, teamId);
}

export async function removeTeamFromTournament(tournamentId: string, teamId: string): Promise<void> {
    await getTournament(tournamentId);
    await unregisterTeam(tournamentId, teamId);
}

export async function getTournamentTeams(tournamentId: string): Promise<Team[]> {
    await getTournament(tournamentId);
    return listTournamentTeams(tournamentId);
}

export async function getTournamentRounds(tournamentId: string): Promise<Round[]> {
    await getTournament(tournamentId);
    return listRounds(tournamentId);
}

export async function createRoundForTournament(input: RoundCreateDto): Promise<Round> {
    await getTournament(input.tournamentId);
    return createRound(input);
}

export async function getTournamentMatches(tournamentId: string): Promise<Match[]> {
    await getTournament(tournamentId);
    return listMatchesByTournament(tournamentId);
}

export async function createMatchForTournament(input: MatchCreateDto): Promise<Match> {
    await getTournament(input.tournamentId);

    const round = await findRoundById(input.roundId);
    if (!round || round.tournamentId !== input.tournamentId) {
        throw new NotFoundError('Round not found for this tournament.');
    }

    const homeTeam = await findTeamById(input.homeTeamId);
    const awayTeam = await findTeamById(input.awayTeamId);

    if (!homeTeam || !awayTeam) {
        throw new NotFoundError('One or both teams were not found.');
    }

    const parsedDate = new Date(input.matchDate);
    if (Number.isNaN(parsedDate.getTime())) {
        throw new ValidationError('Match date must be a valid ISO date.');
    }

    const match = new Match({
        id: '',
        tournamentId: input.tournamentId,
        roundId: input.roundId,
        homeTeamId: input.homeTeamId,
        awayTeamId: input.awayTeamId,
        refereeId: input.refereeId ?? null,
        homeScore: null,
        awayScore: null,
        matchDate: parsedDate,
        status: 'SCHEDULED',
    });

    return createMatch({
        tournamentId: match.tournamentId,
        roundId: match.roundId,
        homeTeamId: match.homeTeamId,
        awayTeamId: match.awayTeamId,
        matchDate: match.matchDate,
        refereeId: match.refereeId ?? undefined,
    });
}

export async function updateMatchScore(matchId: string, input: MatchResultDto, actor: { id: string; role: string; }): Promise<Match> {
    const existingMatch = await findMatchById(matchId);

    if (!existingMatch) {
        throw new NotFoundError('Match not found.');
    }

    const isAdmin = actor.role === 'ADMIN';
    const isAssignedReferee = actor.role === 'REFEREE' && existingMatch.refereeId === actor.id;

    if (!isAdmin && !isAssignedReferee) {
        throw new ForbiddenError('Only admin or the assigned referee can update this match result.');
    }

    const updatedMatch = new Match({
        id: existingMatch.id,
        tournamentId: existingMatch.tournamentId,
        roundId: existingMatch.roundId,
        homeTeamId: existingMatch.homeTeamId,
        awayTeamId: existingMatch.awayTeamId,
        refereeId: existingMatch.refereeId,
        homeScore: input.homeScore,
        awayScore: input.awayScore,
        matchDate: existingMatch.matchDate,
        status: input.status ?? 'COMPLETED',
        createdAt: existingMatch.createdAt,
        updatedAt: new Date(),
    });

    return updateMatchResult(matchId, {
        homeScore: updatedMatch.homeScore ?? 0,
        awayScore: updatedMatch.awayScore ?? 0,
        status: updatedMatch.status,
    });
}

export async function getTournamentStandings(tournamentId: string): Promise<StandingsRow[]> {
    await getTournament(tournamentId);

    const teams = await listTournamentTeams(tournamentId);
    const matches = await listMatchesByTournament(tournamentId);

    const standings = new Map<string, StandingsRow>();

    for (const team of teams) {
        standings.set(team.id, {
            teamId: team.id,
            teamName: team.name,
            played: 0,
            won: 0,
            drawn: 0,
            lost: 0,
            goalsFor: 0,
            goalsAgainst: 0,
            goalDifference: 0,
            points: 0,
        });
    }

    for (const match of matches) {
        if (match.status !== 'COMPLETED') {
            continue;
        }

        if (match.homeScore === null || match.awayScore === null) {
            continue;
        }

        const homeRow = standings.get(match.homeTeamId);
        const awayRow = standings.get(match.awayTeamId);

        if (!homeRow || !awayRow) {
            continue;
        }

        homeRow.played += 1;
        awayRow.played += 1;
        homeRow.goalsFor += match.homeScore;
        homeRow.goalsAgainst += match.awayScore;
        awayRow.goalsFor += match.awayScore;
        awayRow.goalsAgainst += match.homeScore;

        if (match.homeScore > match.awayScore) {
            homeRow.won += 1;
            awayRow.lost += 1;
            homeRow.points += 3;
        } else if (match.homeScore < match.awayScore) {
            awayRow.won += 1;
            homeRow.lost += 1;
            awayRow.points += 3;
        } else {
            homeRow.drawn += 1;
            awayRow.drawn += 1;
            homeRow.points += 1;
            awayRow.points += 1;
        }

        homeRow.goalDifference = homeRow.goalsFor - homeRow.goalsAgainst;
        awayRow.goalDifference = awayRow.goalsFor - awayRow.goalsAgainst;
    }

    return [...standings.values()].sort((left, right) => {
        if (right.points !== left.points) {
            return right.points - left.points;
        }

        if (right.goalDifference !== left.goalDifference) {
            return right.goalDifference - left.goalDifference;
        }

        if (right.goalsFor !== left.goalsFor) {
            return right.goalsFor - left.goalsFor;
        }

        return left.teamName.localeCompare(right.teamName);
    });
}

export async function getTournamentOverview(tournamentId: string) {
    const tournament = await getTournament(tournamentId);
    const [teams, rounds, matches, standings] = await Promise.all([
        getTournamentTeams(tournamentId),
        getTournamentRounds(tournamentId),
        getTournamentMatches(tournamentId),
        getTournamentStandings(tournamentId),
    ]);

    return {
        tournament,
        teams,
        rounds,
        matches,
        standings,
    };
}