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
  const matchId = parseInt(req.params.matchId, 10);
  const match = await getMatch(matchId);
  res.json(match);
}));

matchRouter.patch('/:matchId/status', authenticateToken, requireRoles('ADMIN', 'REFEREE'), asyncHandler(async (req, res) => {
  const user = getAuthenticatedUser(req);
  const matchId = parseInt(req.params.matchId, 10);
  const match = await updateMatchStatus(matchId, req.body.status, user);
  res.json(match);
}));

matchRouter.put('/:matchId/result', authenticateToken, requireRoles('ADMIN', 'REFEREE'), asyncHandler(async (req, res) => {
  const user = getAuthenticatedUser(req);
  const matchId = parseInt(req.params.matchId, 10);
  const match = await updateMatchResult(matchId, req.body, user);
  res.json(match);
}));

matchRouter.post('/:matchId/goals', authenticateToken, requireRoles('ADMIN', 'REFEREE'), asyncHandler(async (req, res) => {
  const user = getAuthenticatedUser(req);
  const matchId = parseInt(req.params.matchId, 10);
  const goal = await addGoal(matchId, req.body, user);
  res.status(201).json(goal);
}));

matchRouter.patch('/:matchId/goals/:goalId', authenticateToken, requireRoles('ADMIN', 'REFEREE'), asyncHandler(async (req, res) => {
  const user = getAuthenticatedUser(req);
  const matchId = parseInt(req.params.matchId, 10);
  const goalId = parseInt(req.params.goalId, 10);
  const goal = await updateGoal(matchId, goalId, req.body, user);
  res.json(goal);
}));
