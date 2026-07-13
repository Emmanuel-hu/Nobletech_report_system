import { createContext, useContext, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { defaultAuthSession, type AuthSession } from '../types/auth';

type AuthContextValue = {
  session: AuthSession;
  can: (permission: string) => boolean;
  setSession: (session: AuthSession) => void;
};

const STORAGE_KEY = 'nemp.admin.session';

const readStoredSession = (): AuthSession => {
  try {
    const serialized = window.localStorage.getItem(STORAGE_KEY);
    if (!serialized) {
      return defaultAuthSession;
    }

    const parsed = JSON.parse(serialized) as Partial<AuthSession>;
    if (!parsed.userId || !parsed.schoolId || !Array.isArray(parsed.permissions)) {
      return defaultAuthSession;
    }

    return {
      userId: parsed.userId,
      schoolId: parsed.schoolId,
      permissions: parsed.permissions,
    };
  } catch {
    return defaultAuthSession;
  }
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider = ({ children, initialSession }: PropsWithChildren<{ initialSession?: AuthSession }>) => {
  const [session, setSessionState] = useState<AuthSession>(initialSession ?? readStoredSession());

  const setSession = (next: AuthSession): void => {
    setSessionState(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const value = useMemo<AuthContextValue>(() => {
    const normalizedPermissions = new Set(session.permissions.map((permission) => permission.toLowerCase()));

    return {
      session,
      can: (permission: string) => normalizedPermissions.has(permission.toLowerCase()),
      setSession,
    };
  }, [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
};
