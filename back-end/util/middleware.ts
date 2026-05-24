import { NextFunction, Request, Response } from 'express';
import { ForbiddenError, UnauthorizedError, ApplicationError } from './errors';
import { verifyAccessToken } from './jwt';

export type RequestUser = {
    id: string;
    username: string;
    role: string;
};

export function authenticateToken(req: Request, _res: Response, next: NextFunction): void {
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
        next(new UnauthorizedError('You must send a Bearer token to access this route.'));
        return;
    }

    const token = header.slice('Bearer '.length);
    const payload = verifyAccessToken(token);

    (req as Request & { user?: RequestUser }).user = {
        id: payload.sub,
        username: payload.username,
        role: payload.role,
    };

    next();
}

export function requireRoles(...roles: string[]) {
    return (req: Request, _res: Response, next: NextFunction): void => {
        const user = (req as Request & { user?: RequestUser }).user;

        if (!user) {
            next(new UnauthorizedError());
            return;
        }

        if (!roles.includes(user.role)) {
            next(new ForbiddenError());
            return;
        }

        next();
    };
}

export function asyncHandler(handler: (req: Request, res: Response, next: NextFunction) => Promise<void> | void) {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(handler(req, res, next)).catch(next);
    };
}

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction): void {
    if (error instanceof ApplicationError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
    }

    const message = error instanceof Error ? error.message : 'An unexpected error occurred.';
    res.status(500).json({ error: message });
}