import { Router } from 'express';
import { asyncHandler, authenticateToken, requireRoles } from '../util/middleware';
import { UnauthorizedError } from '../util/errors';
import { successResponse } from '../util/response';
import { updateMatchScore } from '../service/tournamentService';

export const matchRouter = Router();

matchRouter.put('/:id/result', authenticateToken, requireRoles('ADMIN', 'REFEREE'), asyncHandler(async (req, res) => {
    const user = (req as typeof req & { user?: { id: string; role: string } }).user;
    if (!user) {
        throw new UnauthorizedError();
    }

    const match = await updateMatchScore(req.params.id, req.body, user);
    res.json(successResponse(match, 'Match score updated successfully.'));
}));