import { Router } from 'express';
import { asyncHandler, authenticateToken, requireRoles } from '../util/middleware';
import { createTeam, deleteTeam, getTeam, listTeamPlayers, listTeams, updateTeam } from '../service/teamService';

export const teamRouter = Router();

teamRouter.get('/', asyncHandler(async (_req, res) => {
  const teams = await listTeams();
  res.json(teams);
}));

teamRouter.get('/:teamId', asyncHandler(async (req, res) => {
  const team = await getTeam(req.params.teamId);
  res.json(team);
}));

teamRouter.get('/:teamId/players', asyncHandler(async (req, res) => {
  const players = await listTeamPlayers(req.params.teamId);
  res.json(players);
}));

teamRouter.post('/', authenticateToken, requireRoles('ADMIN'), asyncHandler(async (req, res) => {
  const team = await createTeam(req.body);
  res.status(201).json(team);
}));

teamRouter.put('/:teamId', authenticateToken, requireRoles('ADMIN'), asyncHandler(async (req, res) => {
  const team = await updateTeam(req.params.teamId, req.body);
  res.json(team);
}));

teamRouter.delete('/:teamId', authenticateToken, requireRoles('ADMIN'), asyncHandler(async (req, res) => {
  await deleteTeam(req.params.teamId);
  res.status(204).send();
}));
