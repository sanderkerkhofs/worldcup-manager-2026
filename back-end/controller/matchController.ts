import { Router } from 'express';
import { asyncHandler, authenticateToken, getAuthenticatedUser, requireRoles } from '../util/middleware';
import { addGoal, getMatch, getTopScorers, listMatches, updateGoal, updateMatchResult, updateMatchStatus } from '../service/matchService';

export const matchRouter = Router();

matchRouter.get('/', asyncHandler(async (_req, res) => {
  const matches = await listMatches();
  res.json(matches);
}));

matchRouter.get('/top-scorers', asyncHandler(async (_req, res) => {
  const topScorers = await getTopScorers();
  res.json(topScorers);
}));

matchRouter.get('/:matchId', asyncHandler(async (req, res) => {
  const match = await getMatch(req.params.matchId);
  res.json(match);
}));

matchRouter.patch('/:matchId/status', authenticateToken, requireRoles('ADMIN', 'REFEREE'), asyncHandler(async (req, res) => {
  const user = getAuthenticatedUser(req);
  const match = await updateMatchStatus(req.params.matchId, req.body.status, user);
  res.json(match);
}));

matchRouter.put('/:matchId/result', authenticateToken, requireRoles('ADMIN', 'REFEREE'), asyncHandler(async (req, res) => {
  const user = getAuthenticatedUser(req);
  const match = await updateMatchResult(req.params.matchId, req.body, user);
  res.json(match);
}));

matchRouter.post('/:matchId/goals', authenticateToken, requireRoles('ADMIN', 'REFEREE'), asyncHandler(async (req, res) => {
  const user = getAuthenticatedUser(req);
  const goal = await addGoal(req.params.matchId, req.body, user);
  res.status(201).json(goal);
}));

matchRouter.patch('/:matchId/goals/:goalId', authenticateToken, requireRoles('ADMIN', 'REFEREE'), asyncHandler(async (req, res) => {
  const user = getAuthenticatedUser(req);
  const goal = await updateGoal(req.params.matchId, req.params.goalId, req.body, user);
  res.json(goal);
}));
