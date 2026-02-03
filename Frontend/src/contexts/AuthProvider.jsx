// src/contexts/AuthProvider.jsx
import { useState, useEffect, useCallback, useMemo, createContext } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  const initializeAuth = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        const response = await axios.get(`${API_BASE_URL}/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.data.success) {
          setUser(response.data.data.user);
        } else {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const login = useCallback(async (email, password) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, { email, password });

      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        toast.success('Login successful!');
        return { success: true, user };
      } else {
        toast.error(response.data.error || 'Login failed');
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      toast.error('An error occurred during login');
      return { success: false, error: error.response?.data?.error || 'Login failed' };
    }
  }, [API_BASE_URL]);

  const register = useCallback(async (userData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setUser(user);
        toast.success('Registration successful!');
        return { success: true, user };
      } else {
        toast.error(response.data.error || 'Registration failed');
        return { success: false, error: response.data.error };
      }
    } catch (error) {
      toast.error('An error occurred during registration');
      return { success: false, error: error.response?.data?.error || 'Registration failed' };
    }
  }, [API_BASE_URL]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Logged out successfully');
  }, []);

  const apiCall = useCallback(async (method, url, data = null) => {
    try {
      const token = localStorage.getItem('token');
      const config = {
        method,
        url: `${API_BASE_URL}${url}`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      };

      if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      console.error('API call error:', error);
      const errorMsg = error.response?.data?.error || 'API call failed';
      toast.error(errorMsg);
      throw error;
    }
  }, [API_BASE_URL]);

  const value = useMemo(() => ({
    user,
    login,
    register,
    logout,
    loading,
    apiCall,
    isAuthenticated: !!user
  }), [user, login, register, logout, loading, apiCall]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;