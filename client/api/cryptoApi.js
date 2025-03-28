import axios from 'axios';
import { API_URL } from '../config';

/**
 * Get user's crypto balance
 * @returns {Promise} - The API response
 */
export const fetchCryptoBalance = async () => {
  return axios.get(`${API_URL}/api/crypto/balance`);
};

/**
 * Get current cryptocurrency prices
 * @returns {Promise} - The API response
 */
export const fetchCryptoPrices = async () => {
  return axios.get(`${API_URL}/api/crypto/prices`);
};

/**
 * Purchase cryptocurrency with in-game currency
 * @param {string} cryptoType - The type of cryptocurrency to purchase
 * @param {number} amount - The amount to purchase
 * @returns {Promise} - The API response
 */
export const purchaseCrypto = async (cryptoType, amount) => {
  return axios.post(`${API_URL}/api/crypto/purchase`, {
    cryptoType,
    amount
  });
};

/**
 * Sell cryptocurrency for in-game currency
 * @param {string} cryptoType - The type of cryptocurrency to sell
 * @param {number} amount - The amount to sell
 * @returns {Promise} - The API response
 */
export const sellCrypto = async (cryptoType, amount) => {
  return axios.post(`${API_URL}/api/crypto/sell`, {
    cryptoType,
    amount
  });
};

/**
 * Withdraw cryptocurrency to external wallet
 * @param {string} cryptoType - The type of cryptocurrency to withdraw
 * @param {number} amount - The amount to withdraw
 * @param {string} walletAddress - The wallet address to withdraw to
 * @returns {Promise} - The API response
 */
export const withdrawCrypto = async (cryptoType, amount, walletAddress) => {
  return axios.post(`${API_URL}/api/crypto/withdraw`, {
    cryptoType,
    amount,
    walletAddress
  });
};

/**
 * Deposit cryptocurrency from external wallet
 * @param {string} cryptoType - The type of cryptocurrency to deposit
 * @param {number} amount - The amount to deposit
 * @returns {Promise} - The API response
 */
export const depositCrypto = async (cryptoType, amount) => {
  return axios.post(`${API_URL}/api/crypto/deposit`, {
    cryptoType,
    amount
  });
};

/**
 * Get user's crypto transactions
 * @param {number} page - The page number
 * @param {number} limit - The number of transactions per page
 * @param {string} type - The type of transaction to filter by
 * @returns {Promise} - The API response
 */
export const fetchCryptoTransactions = async (page = 1, limit = 10, type = null) => {
  let url = `${API_URL}/api/crypto/transactions?page=${page}&limit=${limit}`;
  if (type) {
    url += `&type=${type}`;
  }
  return axios.get(url);
};

/**
 * Get user's crypto portfolio
 * @returns {Promise} - The API response
 */
export const fetchCryptoPortfolio = async () => {
  return axios.get(`${API_URL}/api/crypto/portfolio`);
};

/**
 * Get list of supported cryptocurrencies
 * @returns {Promise} - The API response
 */
export const fetchSupportedCryptos = async () => {
  return axios.get(`${API_URL}/api/crypto/supported`);
};

/**
 * Convert between different cryptocurrencies
 * @param {string} fromCrypto - The source cryptocurrency
 * @param {string} toCrypto - The target cryptocurrency
 * @param {number} amount - The amount to convert
 * @returns {Promise} - The API response
 */
export const convertCrypto = async (fromCrypto, toCrypto, amount) => {
  return axios.post(`${API_URL}/api/crypto/convert`, {
    fromCrypto,
    toCrypto,
    amount
  });
};