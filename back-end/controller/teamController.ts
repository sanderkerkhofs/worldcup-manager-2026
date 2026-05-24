import { Router } from 'express';
import { asyncHandler, authenticateToken, requireRoles } from '../util/middleware';
import { successResponse } from '../util/response';
import { createTeam, deleteTeam, listTeams } from '../repository/teamRepository';
import { Team } from '../model/team';

export const teamRouter = Router();

teamRouter.get('/', asyncHandler(async (_req, res) => {
    const teams = await listTeams();
    res.json(successResponse(teams, 'Teams loaded successfully.'));
}));

teamRouter.post('/', authenticateToken, requireRoles('ADMIN', 'ORGANIZER'), asyncHandler(async (req, res) => {
    const team = await createTeam(req.body);
    res.status(201).json(successResponse(team, 'Team created successfully.'));
}));

teamRouter.delete('/:id', authenticateToken, requireRoles('ADMIN', 'ORGANIZER'), asyncHandler(async (req, res) => {
    await deleteTeam(req.params.id);
    res.status(204).send();
}));

export function teamToResponse(team: Team) {
    return {
        id: team.id,
        name: team.name,
        country: team.country,
        coach: team.coach,
        createdAt: team.createdAt,
        updatedAt: team.updatedAt,
    };
}