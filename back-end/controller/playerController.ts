import { Router } from 'express';
import { asyncHandler, authenticateToken, requireRoles } from '../util/middleware';
import { createPlayer, deletePlayer, getPlayer, listPlayers, updatePlayer, updatePlayerStatus } from '../service/playerService';

export const playerRouter = Router();

playerRouter.get('/', asyncHandler(async (req, res) => {
  const teamId = typeof req.query.teamId === 'string' ? req.query.teamId : undefined;
  const players = await listPlayers(teamId);
  res.json(players);
}));

playerRouter.get('/:playerId', asyncHandler(async (req, res) => {
  const player = await getPlayer(req.params.playerId);
  res.json(player);
}));

playerRouter.post('/', authenticateToken, requireRoles('ADMIN'), asyncHandler(async (req, res) => {
  const player = await createPlayer(req.body);
  res.status(201).json(player);
}));

playerRouter.put('/:playerId', authenticateToken, requireRoles('ADMIN'), asyncHandler(async (req, res) => {
  const player = await updatePlayer(req.params.playerId, req.body);
  res.json(player);
}));

playerRouter.patch('/:playerId/status', authenticateToken, requireRoles('ADMIN'), asyncHandler(async (req, res) => {
  const player = await updatePlayerStatus(req.params.playerId, req.body.status);
  res.json(player);
}));

playerRouter.delete('/:playerId', authenticateToken, requireRoles('ADMIN'), asyncHandler(async (req, res) => {
  await deletePlayer(req.params.playerId);
  res.status(204).send();
}));
