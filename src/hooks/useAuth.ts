import { useCallback, useEffect, useState } from 'react';
import { api, isApiRequestError, type AuthUser } from '../api/client';

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const clearSession = useCallback(() => {
    setUser(null);
  }, []);

  useEffect(() => {
    let active = true;

    api.getSession()
      .then((res) => {
        if (active) {
          setUser(res.user);
        }
      })
      .catch((error: unknown) => {
        if (!active) return;
        if (isApiRequestError(error) && error.status === 401) {
          setUser(null);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(async (username: string, password: string) => {
    const res = await api.login(username, password);
    setUser(res.user);
  }, []);

  const register = useCallback(async (username: string, password: string) => {
    const res = await api.register(username, password);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.logout();
    } finally {
      setUser(null);
    }
  }, []);

  return {
    user,
    loading,
    login,
    register,
    logout,
    clearSession,
  };
}
