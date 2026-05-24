import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { AuthUser } from '../types';
import { clearSession, readStoredToken, readStoredUser, storeSession } from './session';

type SessionContextValue = {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  setSession: (token: string, user: AuthUser) => void;
  logout: () => void;
};

const SessionContext = createContext<SessionContextValue | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    setToken(readStoredToken());
    setUser(readStoredUser());
  }, []);

  const value = useMemo<SessionContextValue>(() => ({
    token,
    user,
    isAuthenticated: Boolean(token && user),
    setSession: (nextToken: string, nextUser: AuthUser) => {
      storeSession(nextToken, nextUser);
      setToken(nextToken);
      setUser(nextUser);
    },
    logout: () => {
      clearSession();
      setToken(null);
      setUser(null);
    },
  }), [token, user]);

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useSession must be used inside SessionProvider.');
  }

  return context;
}
