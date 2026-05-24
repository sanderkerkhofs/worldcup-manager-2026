import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { AuthSession } from '@types';
import { clearSession, loadSession, saveSession } from './session';

type SessionContextValue = {
    session: AuthSession | null;
    ready: boolean;
    persist: (nextSession: AuthSession) => void;
    signOut: () => void;
};

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
    const [session, setSession] = useState<AuthSession | null>(null);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setSession(loadSession());
        setReady(true);
    }, []);

    function persist(nextSession: AuthSession) {
        saveSession(nextSession);
        setSession(nextSession);
    }

    function signOut() {
        clearSession();
        setSession(null);
    }

    return (
        <SessionContext.Provider value={{ session, ready, persist, signOut }}>
            {children}
        </SessionContext.Provider>
    );
}

export function useSession() {
    const context = useContext(SessionContext);

    if (!context) {
        throw new Error('useSession must be used inside a SessionProvider.');
    }

    return context;
}