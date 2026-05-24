import { Router } from 'express';
import { asyncHandler, authenticateToken } from '../util/middleware';
import { successResponse } from '../util/response';
import { loginUser, registerUser } from '../service/authService';

export const authRouter = Router();

authRouter.post('/register', asyncHandler(async (req, res) => {
    const result = await registerUser(req.body);
    res.status(201).json(successResponse(result, 'User registered successfully.'));
}));

authRouter.post('/login', asyncHandler(async (req, res) => {
    const result = await loginUser(req.body);
    res.json(successResponse(result, 'Login successful.'));
}));

authRouter.get('/me', authenticateToken, asyncHandler(async (req, res) => {
    const user = (req as typeof req & { user?: { id: string; username: string; role: string } }).user;
    res.json(successResponse(user, 'Current user loaded.'));
}));