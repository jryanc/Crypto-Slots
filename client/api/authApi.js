import axios from 'axios';
import { API_URL } from '../config';

/**
 * Register a new user
 * @param {string} username - The username
 * @param {string} email - The email address
 * @param {string} password - The password
 * @returns {Promise} - The API response
 */
export const register = async (username, email, password) => {
  return axios.post(`${API_URL}/api/auth/register`, {
    username,
    email,
    password
  });
};

/**
 * Login a user
 * @param {string} email - The email address
 * @param {string} password - The password
 * @returns {Promise} - The API response
 */
export const login = async (email, password) => {
  return axios.post(`${API_URL}/api/auth/login`, {
    email,
    password
  });
};

/**
 * Get authenticated user
 * @returns {Promise} - The API response
 */
export const getAuthUser = async () => {
  return axios.get(`${API_URL}/api/auth`);
};

/**
 * Set up two-factor authentication
 * @returns {Promise} - The API response
 */
export const setup2FA = async () => {
  return axios.post(`${API_URL}/api/auth/2fa/setup`);
};

/**
 * Verify two-factor authentication
 * @param {string} token - The verification code
 * @returns {Promise} - The API response
 */
export const verify2FA = async (token) => {
  return axios.post(`${API_URL}/api/auth/2fa/verify`, { token });
};

/**
 * Social media authentication
 * @param {string} provider - The social media provider
 * @param {string} token - The authentication token
 * @param {string} email - The email address
 * @param {string} name - The user's name
 * @returns {Promise} - The API response
 */
export const socialAuth = async (provider, token, email, name) => {
  return axios.post(`${API_URL}/api/auth/social`, {
    provider,
    token,
    email,
    name
  });
};

/**
 * Refresh JWT token
 * @param {string} token - The current token
 * @returns {Promise} - The API response
 */
export const refreshToken = async (token) => {
  return axios.post(`${API_URL}/api/auth/refresh-token`, { token });
};

/**
 * Send password reset email
 * @param {string} email - The email address
 * @returns {Promise} - The API response
 */
export const forgotPassword = async (email) => {
  return axios.post(`${API_URL}/api/auth/forgot-password`, { email });
};

/**
 * Reset password
 * @param {string} token - The reset token
 * @param {string} password - The new password
 * @returns {Promise} - The API response
 */
export const resetPassword = async (token, password) => {
  return axios.post(`${API_URL}/api/auth/reset-password`, {
    token,
    password
  });
};