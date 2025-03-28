import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import axios from 'axios';
import { API_URL } from '../config';

// Create context
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth state
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync('authToken');
        
        if (storedToken) {
          setToken(storedToken);
          
          // Set axios default header
          axios.defaults.headers.common['x-auth-token'] = storedToken;
          
          // Fetch user data
          await loadUser(storedToken);
        } else {
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error loading auth token:', err);
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  // Load user data
  const loadUser = async (authToken) => {
    try {
      const res = await axios.get(`${API_URL}/api/auth`, {
        headers: {
          'x-auth-token': authToken
        }
      });

      setUser(res.data);
      setIsAuthenticated(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading user:', err);
      await SecureStore.deleteItemAsync('authToken');
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      
      // Clear axios default header
      delete axios.defaults.headers.common['x-auth-token'];
    }
  };

  // Login
  const login = async (email, password) => {
    setError(null);
    
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, {
        email,
        password
      });

      const { token: authToken, requiresTwoFactor } = res.data;
      
      if (requiresTwoFactor) {
        // Return token for 2FA verification
        return { requiresTwoFactor: true, tempToken: authToken };
      }

      // Save token to secure storage
      await SecureStore.setItemAsync('authToken', authToken);
      
      // Set token in state and axios header
      setToken(authToken);
      axios.defaults.headers.common['x-auth-token'] = authToken;
      
      // Load user data
      await loadUser(authToken);
      
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || 'Login failed');
      return { success: false, error: err.response?.data?.message || 'Login failed' };
    }
  };

  // Register
  const register = async (username, email, password) => {
    setError(null);
    
    try {
      const res = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        email,
        password
      });

      const { token: authToken } = res.data;

      // Save token to secure storage
      await SecureStore.setItemAsync('authToken', authToken);
      
      // Set token in state and axios header
      setToken(authToken);
      axios.defaults.headers.common['x-auth-token'] = authToken;
      
      // Load user data
      await loadUser(authToken);
      
      return { success: true };
    } catch (err) {
      console.error('Register error:', err);
      setError(err.response?.data?.message || 'Registration failed');
      return { success: false, error: err.response?.data?.message || 'Registration failed' };
    }
  };

  // Verify 2FA
  const verify2FA = async (tempToken, code) => {
    setError(null);
    
    try {
      const res = await axios.post(
        `${API_URL}/api/auth/2fa/verify`,
        { token: code },
        {
          headers: {
            'x-auth-token': tempToken
          }
        }
      );

      const { token: authToken } = res.data;

      // Save token to secure storage
      await SecureStore.setItemAsync('authToken', authToken);
      
      // Set token in state and axios header
      setToken(authToken);
      axios.defaults.headers.common['x-auth-token'] = authToken;
      
      // Load user data
      await loadUser(authToken);
      
      return { success: true };
    } catch (err) {
      console.error('2FA verification error:', err);
      setError(err.response?.data?.message || '2FA verification failed');
      return { success: false, error: err.response?.data?.message || '2FA verification failed' };
    }
  };

  // Logout
  const logout = async () => {
    try {
      // Remove token from secure storage
      await SecureStore.deleteItemAsync('authToken');
      
      // Clear state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      // Clear axios default header
      delete axios.defaults.headers.common['x-auth-token'];
      
      return { success: true };
    } catch (err) {
      console.error('Logout error:', err);
      return { success: false, error: 'Logout failed' };
    }
  };

  // Update user data
  const updateUser = (userData) => {
    setUser(prevUser => ({
      ...prevUser,
      ...userData
    }));
  };

  // Context value
  const value = {
    isAuthenticated,
    user,
    token,
    isLoading,
    error,
    login,
    register,
    verify2FA,
    logout,
    updateUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};