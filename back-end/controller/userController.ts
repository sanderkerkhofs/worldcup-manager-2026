import { Router } from 'express';
import { asyncHandler, authenticateToken, getAuthenticatedUser, requireRoles } from '../util/middleware';
import { deleteUserForAdmin, listUsersForAdmin } from '../service/userService';

export const userRouter = Router();

userRouter.get('/', authenticateToken, requireRoles('ADMIN'), asyncHandler(async (_req, res) => {
  const users = await listUsersForAdmin();
  res.json(users);
}));

userRouter.delete('/:userId', authenticateToken, requireRoles('ADMIN'), asyncHandler(async (req, res) => {
  const actor = getAuthenticatedUser(req);
  await deleteUserForAdmin(req.params.userId, actor.id);
  res.status(204).send();
}));
