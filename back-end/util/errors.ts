export class ApplicationError extends Error {
    public readonly statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ApplicationError';
    }
}

export class ValidationError extends ApplicationError {
    constructor(message: string) {
        super(message, 400);
        this.name = 'ValidationError';
    }
}

export class UnauthorizedError extends ApplicationError {
    constructor(message = 'You are not allowed to access this resource.') {
        super(message, 401);
        this.name = 'UnauthorizedError';
    }
}

export class ForbiddenError extends ApplicationError {
    constructor(message = 'You are not allowed to perform this action.') {
        super(message, 403);
        this.name = 'ForbiddenError';
    }
}

export class NotFoundError extends ApplicationError {
    constructor(message = 'The requested resource was not found.') {
        super(message, 404);
        this.name = 'NotFoundError';
    }
}