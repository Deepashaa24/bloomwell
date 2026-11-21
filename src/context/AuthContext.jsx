import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext(null);

const getAuthPayload = (response) => {
  const { token, user } = response.data || {};
  if (!token || !user) {
    throw new Error('The authentication server returned an invalid response');
  }
  return { token, user };
};

const getAuthErrorMessage = (error) => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  if (error.request) {
    return 'Unable to reach the authentication server. Check VITE_API_URL and backend logs.';
  }
  return error.message || 'Authentication failed';
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        setToken(storedToken);
        try {
          setUser(JSON.parse(storedUser));
        } catch (error) {
          console.error('Could not parse stored user profile:', error);
          localStorage.removeItem('user');
        }
        try {
          const response = await authAPI.getMe();
          const nextUser = response.data.user;
          localStorage.setItem('user', JSON.stringify(nextUser));
          setUser(nextUser);
        } catch (error) {
          console.error('Could not refresh user profile:', getAuthErrorMessage(error));
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = getAuthPayload(response);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setToken(token);
      setUser(user);

      return { success: true };
    } catch (error) {
      console.error('Login error:', getAuthErrorMessage(error));
      return {
        success: false,
        error: getAuthErrorMessage(error),
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await authAPI.register(name, email, password);
      const { token, user } = getAuthPayload(response);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setToken(token);
      setUser(user);

      return { success: true };
    } catch (error) {
      console.error('Register error:', getAuthErrorMessage(error));
      return {
        success: false,
        error: getAuthErrorMessage(error),
      };
    }
  };
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const updateUser = (updates) => {
    setUser((current) => {
      const next = { ...(current || {}), ...updates };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      login,
      register,
      logout,
      updateUser,
      isAuthenticated: Boolean(token && user),
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

