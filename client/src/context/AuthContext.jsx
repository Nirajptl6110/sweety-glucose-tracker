import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api, { AUTH_STORAGE_KEY } from '../services/api';

const AuthContext = createContext(null);

function readSavedAuth() {
  try {
    return JSON.parse(sessionStorage.getItem(AUTH_STORAGE_KEY) || 'null');
  } catch {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readSavedAuth);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = useCallback(() => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setAuth(null);
  }, []);

  useEffect(() => {
    const onLogout = () => setAuth(null);
    window.addEventListener('sweety:logout', onLogout);

    if (!auth?.token) {
      setIsLoading(false);
      return () => window.removeEventListener('sweety:logout', onLogout);
    }

    api.get('/auth/me')
      .then(({ data }) => {
        const nextAuth = { ...auth, user: { ...auth.user, id: data.data.user.id } };
        sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
        setAuth(nextAuth);
      })
      .catch(() => clearAuth())
      .finally(() => setIsLoading(false));

    return () => window.removeEventListener('sweety:logout', onLogout);
  // The session is verified once when the provider mounts.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    const nextAuth = { token: data.data.token, user: data.data.user };
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(nextAuth));
    setAuth(nextAuth);
    return nextAuth.user;
  }, []);

  const signup = useCallback(async (details) => {
    const { data } = await api.post('/auth/register', details);
    return data.data.user;
  }, []);

  const logout = useCallback(() => clearAuth(), [clearAuth]);
  const value = useMemo(() => ({
    user: auth?.user || null,
    token: auth?.token || null,
    isAuthenticated: Boolean(auth?.token),
    isLoading,
    login,
    signup,
    logout,
  }), [auth, isLoading, login, signup, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider.');
  return context;
}
