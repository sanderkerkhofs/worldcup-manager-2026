import { api } from '../lib/api';
import { CompetitionOverview, Goal, GoalInput, Match, MatchStatus, Player, PlayerStatus, Round, RoundSimulationResult, TopScorerRow } from '../types';

export function getOverview(token?: string | null) {
  return api.get<CompetitionOverview>('/api/competition/overview', token);
}

export function getRounds(token?: string | null) {
  return api.get<Round[]>('/api/competition/rounds', token);
}

export function simulateRound(roundId: string, token: string) {
  return api.post<RoundSimulationResult>(`/api/competition/rounds/${roundId}/simulate`, {}, token);
}

export function getMatch(matchId: string, token?: string | null) {
  return api.get<Match>(`/api/matches/${matchId}`, token);
}

export function getPlayers(teamId: string, token?: string | null) {
  return api.get<Player[]>(`/api/players?teamId=${encodeURIComponent(teamId)}`, token);
}

export function updatePlayerStatus(playerId: string, status: PlayerStatus, token: string) {
  return api.patch<Player>(`/api/players/${playerId}/status`, { status }, token);
}

export function updateMatchStatus(matchId: string, status: MatchStatus, token: string) {
  return api.patch<Match>(`/api/matches/${matchId}/status`, { status }, token);
}

export function updateMatchResult(matchId: string, homeScore: number, awayScore: number, token: string) {
  return api.put<Match>(`/api/matches/${matchId}/result`, { homeScore, awayScore, status: 'FINISHED' }, token);
}

export function addGoal(matchId: string, input: GoalInput, token: string) {
  return api.post<Goal>(`/api/matches/${matchId}/goals`, input, token);
}

export function updateGoal(matchId: string, goalId: string, input: GoalInput, token: string) {
  return api.patch<Goal>(`/api/matches/${matchId}/goals/${goalId}`, input, token);
}

export function getTopScorers(token?: string | null) {
  return api.get<TopScorerRow[]>('/api/matches/top-scorers', token);
}
