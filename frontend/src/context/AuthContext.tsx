import { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { ApiError, authApi, setAuthToken, getAuthToken } from '../api/client';
import { PublicUser } from '../types';

interface AuthContextValue {
  user: PublicUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(() => {
    const stored = localStorage.getItem('kattrack_user');
    return stored ? (JSON.parse(stored) as PublicUser) : null;
  });

  const persist = useCallback((nextUser: PublicUser, token: string) => {
    setAuthToken(token);
    localStorage.setItem('kattrack_user', JSON.stringify(nextUser));
    setUser(nextUser);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { user: loggedInUser, token } = await authApi.login(email, password);
    persist(loggedInUser, token);
  }, [persist]);

  const register = useCallback(async (email: string, password: string) => {
    const { user: newUser, token } = await authApi.register(email, password);
    persist(newUser, token);
  }, [persist]);

  const logout = useCallback(() => {
    setAuthToken(null);
    localStorage.removeItem('kattrack_user');
    setUser(null);
  }, []);

  // On page load, re-fetch the user: an admin may have changed the role or blocked the account
  // since the data was saved to localStorage.
  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    authApi
      .me()
      .then(({ user: fresh }) => persist(fresh, token))
      .catch((err) => {
        if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
          logout();
        }
      });
  }, [persist, logout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user && getAuthToken()),
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return ctx;
}
