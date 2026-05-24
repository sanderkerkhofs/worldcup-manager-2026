import { Router, Request } from 'express';
import { asyncHandler, authenticateToken, RequestUser } from '../util/middleware';
import { getCurrentUser, loginUser, registerGuestUser } from '../service/authService';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(async (req, res) => {
  const result = await registerGuestUser(req.body);
  res.status(201).json(result);
}));

authRouter.post('/login', asyncHandler(async (req, res) => {
  const result = await loginUser(req.body);
  res.json(result);
}));

authRouter.get('/me', authenticateToken, asyncHandler(async (req, res) => {
  const user = (req as Request & { user?: RequestUser }).user;

  if (!user) {
    throw new Error('Missing authenticated user.');
  }

  const currentUser = await getCurrentUser(user.id);
  res.json(currentUser);
}));
