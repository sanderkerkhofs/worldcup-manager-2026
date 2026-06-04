import { Router } from 'express';
import { asyncHandler } from '../util/middleware';
import { getPlayer, listPlayers } from '../service/playerService';

export const playerRouter = Router();

playerRouter.get('/', asyncHandler(async (req, res) => {
  const teamName = typeof req.query.teamName === 'string' ? req.query.teamName : undefined;
  const players = await listPlayers(teamName);
  res.json(players);
}));

playerRouter.get('/:playerId', asyncHandler(async (req, res) => {
  const playerId = parseInt(req.params.playerId, 10);
  const player = await getPlayer(playerId);
  res.json(player);
}));
