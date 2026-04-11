import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { api, getToken, setToken, clearToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.get('/auth/me');
      const data = await res.json();
      if (res.ok && data.user) {
        setUser(data.user);
      } else {
        clearToken();
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      clearToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = useCallback(
    async ({ identifier, password, accountType }) => {
      setIsLoading(true);
      try {
        const response = await api.post('/auth/login', { identifier, password, accountType });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Login failed');
        }

        setToken(data.token);
        setUser(data.user);

        const fallbackRoute =
          data.user?.role === 'admin'
            ? '/app/admin'
            : data.user?.role === 'professional'
              ? '/app/providers'
              : '/app';

        navigate(location.state?.from?.pathname || fallbackRoute, { replace: true });
        return { success: true };
      } catch (err) {
        clearToken();
        setUser(null);
        return { success: false, error: err.message || 'Unable to connect to the server.' };
      } finally {
        setIsLoading(false);
      }
    },
    [navigate, location.state?.from?.pathname]
  );

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
    navigate('/');
  }, [navigate]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    fetchUser,
    setUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
