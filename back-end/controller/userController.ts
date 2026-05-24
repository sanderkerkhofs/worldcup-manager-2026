import { Router, Request } from 'express';
import { asyncHandler, authenticateToken, requireRoles, RequestUser } from '../util/middleware';
import { deleteUserForAdmin, listUsersForAdmin } from '../service/userService';

export const userRouter = Router();

userRouter.get('/', authenticateToken, requireRoles('ADMIN'), asyncHandler(async (_req, res) => {
  const users = await listUsersForAdmin();
  res.json(users);
}));

userRouter.delete('/:userId', authenticateToken, requireRoles('ADMIN'), asyncHandler(async (req, res) => {
  const actor = (req as Request & { user?: RequestUser }).user;

  if (!actor) {
    throw new Error('Missing authenticated user.');
  }

  await deleteUserForAdmin(req.params.userId, actor.id);
  res.status(204).send();
}));
