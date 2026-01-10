import { createContext, useState } from 'react';
import PropTypes from 'prop-types';
import api from '../services/axios.js';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
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
