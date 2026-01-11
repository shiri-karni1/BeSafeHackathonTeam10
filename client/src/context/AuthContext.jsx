import { createContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../services/axios.js';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const login = (userData) => {
    setUser(userData);
    setError(null);
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/users/logout');
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  // Set up axios interceptor once on mount to handle 401 errors globally
  useEffect(() => {
    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        // If JWT expires during a session, auto-logout
        if (error.response?.status === 401) {
          setUser(null);
        }
        return Promise.reject(error);
      }
    );

    return () => api.interceptors.response.eject(interceptor);
  }, []);

  // Verify authentication on mount using the httpOnly cookie
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await api.get('/users/me');
        if (response.data?.user) {
          setUser(response.data.user);
        }
      } catch {
        // Silent fail - user is not authenticated
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const value = {
    user,
    setUser,
    login,
    logout,
    loading,
    error,
    setError,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export { AuthContext, AuthProvider };
