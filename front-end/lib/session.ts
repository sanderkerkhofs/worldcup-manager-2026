import { AuthSession, AuthUser } from '@types';

const tokenKey = 'tm-token';
const userKey = 'tm-user';
const localeKey = 'tm-locale';

export function loadSession(): AuthSession | null {
    if (typeof window === 'undefined') {
        return null;
    }

    const token = window.localStorage.getItem(tokenKey);
    const rawUser = window.localStorage.getItem(userKey);

    if (!token || !rawUser) {
        return null;
    }

    try {
        const user = JSON.parse(rawUser) as AuthUser;
        return { token, user };
    } catch {
        return null;
    }
}

export function saveSession(session: AuthSession): void {
    window.localStorage.setItem(tokenKey, session.token);
    window.localStorage.setItem(userKey, JSON.stringify(session.user));
}

export function clearSession(): void {
    window.localStorage.removeItem(tokenKey);
    window.localStorage.removeItem(userKey);
}

export function loadLocale(): string | null {
    if (typeof window === 'undefined') {
        return null;
    }

    return window.localStorage.getItem(localeKey);
}

export function saveLocale(locale: string): void {
    window.localStorage.setItem(localeKey, locale);
}