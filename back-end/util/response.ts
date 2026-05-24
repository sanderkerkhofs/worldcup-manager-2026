export function successResponse<T>(data: T, message?: string) {
    return {
        data,
        message,
    };
}

export function errorResponse(message: string) {
    return {
        error: message,
    };
}