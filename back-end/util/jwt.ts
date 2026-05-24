import jwt from 'jsonwebtoken';
import { UnauthorizedError } from './errors';

export type JwtPayload = {
    sub: string;
    username: string;
    role: string;
    teamId: string | null;
};

export function signAccessToken(payload: JwtPayload): string {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET is missing from the environment.');
    }

    return jwt.sign(payload, secret, {
        expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
    });
}

export function verifyAccessToken(token: string): JwtPayload {
    const secret = process.env.JWT_SECRET;

    if (!secret) {
        throw new Error('JWT_SECRET is missing from the environment.');
    }

    try {
        return jwt.verify(token, secret) as JwtPayload;
    } catch {
        throw new UnauthorizedError('Your session token is invalid or expired.');
    }
}