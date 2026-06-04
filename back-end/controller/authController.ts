import { Router } from 'express';
import { asyncHandler, authenticateToken, getAuthenticatedUser } from '../util/middleware';
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
  const user = getAuthenticatedUser(req);
  const currentUser = await getCurrentUser(user.username);
  res.json(currentUser);
}));
