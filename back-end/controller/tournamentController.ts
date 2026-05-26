import { Router } from 'express';
import { asyncHandler, authenticateToken, requireRoles } from '../util/middleware';
import { getCompetitionOverview, listRounds, resetTournamentMatches, simulateRound } from '../service/tournamentService';

export const competitionRouter = Router();
export const tournamentRouter = competitionRouter;

competitionRouter.get('/', asyncHandler(async (_req, res) => {
  const overview = await getCompetitionOverview();
  res.json(overview);
}));

competitionRouter.get('/overview', asyncHandler(async (_req, res) => {
  const overview = await getCompetitionOverview();
  res.json(overview);
}));

competitionRouter.get('/bracket', asyncHandler(async (_req, res) => {
  const overview = await getCompetitionOverview();
  res.json(overview);
}));

competitionRouter.get('/rounds', asyncHandler(async (_req, res) => {
  const rounds = await listRounds();
  res.json(rounds);
}));

competitionRouter.post('/rounds/:roundId/simulate', authenticateToken, requireRoles('ADMIN'), asyncHandler(async (req, res) => {
  const result = await simulateRound(req.params.roundId);
  res.json(result);
}));

competitionRouter.post('/reset-matches', authenticateToken, requireRoles('ADMIN'), asyncHandler(async (_req, res) => {
  const result = await resetTournamentMatches();
  res.json(result);
}));
