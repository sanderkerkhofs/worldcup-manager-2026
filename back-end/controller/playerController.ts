import { Router } from 'express';
import { asyncHandler } from '../util/middleware';
import { getPlayer, listPlayers } from '../service/playerService';

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
