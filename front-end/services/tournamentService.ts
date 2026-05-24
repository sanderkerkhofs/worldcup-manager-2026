import { apiDelete, apiGet, apiPost, apiPut } from '@lib/api';
import {
    MatchInput,
    MatchResultInput,
    RoundInput,
    StandingRow,
    Team,
    TeamInput,
    Tournament,
    TournamentInput,
    TournamentOverview,
} from '@types';

export function listTournaments(): Promise<Tournament[]> {
    return apiGet<Tournament[]>('/tournaments');
}

export function getTournamentOverview(tournamentId: string): Promise<TournamentOverview> {
    return apiGet<TournamentOverview>(`/tournaments/${tournamentId}/overview`);
}

export function createTournament(input: TournamentInput): Promise<Tournament> {
    return apiPost<Tournament>('/tournaments', input);
}

export function updateTournament(tournamentId: string, input: Partial<TournamentInput>): Promise<Tournament> {
    return apiPut<Tournament>(`/tournaments/${tournamentId}`, input);
}

export function deleteTournament(tournamentId: string): Promise<void> {
    return apiDelete<void>(`/tournaments/${tournamentId}`);
}

export function listTournamentTeams(tournamentId: string): Promise<Team[]> {
    return apiGet<Team[]>(`/tournaments/${tournamentId}/teams`);
}

export function listTeams(): Promise<Team[]> {
    return apiGet<Team[]>('/teams');
}

export function registerTeam(tournamentId: string, teamId: string): Promise<void> {
    return apiPost<void>(`/tournaments/${tournamentId}/teams`, { teamId });
}

export function removeTeam(tournamentId: string, teamId: string): Promise<void> {
    return apiDelete<void>(`/tournaments/${tournamentId}/teams/${teamId}`);
}

export function createRound(tournamentId: string, input: RoundInput): Promise<void> {
    return apiPost<void>(`/tournaments/${tournamentId}/rounds`, input);
}

export function createMatch(tournamentId: string, input: MatchInput): Promise<void> {
    return apiPost<void>(`/tournaments/${tournamentId}/matches`, input);
}

export function updateMatchResult(matchId: string, input: MatchResultInput): Promise<void> {
    return apiPut<void>(`/matches/${matchId}/result`, input);
}

export function getStandings(tournamentId: string): Promise<StandingRow[]> {
    return apiGet<StandingRow[]>(`/tournaments/${tournamentId}/standings`);
}

export function createTeam(input: TeamInput): Promise<Team> {
    return apiPost<Team>('/teams', input);
}

export function deleteTeam(teamId: string): Promise<void> {
    return apiDelete<void>(`/teams/${teamId}`);
}