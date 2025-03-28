import axios from 'axios';
import { API_URL } from '../config';

/**
 * Spin the slot machine
 * @param {string} machineId - The ID of the machine to spin
 * @param {number} betAmount - The amount to bet
 * @returns {Promise} - The API response
 */
export const spinSlotMachine = async (machineId, betAmount) => {
  return axios.post(`${API_URL}/api/game/spin`, {
    machineId,
    betAmount
  });
};

/**
 * Get user's slot machines
 * @returns {Promise} - The API response
 */
export const getUserMachines = async () => {
  return axios.get(`${API_URL}/api/game/machines`);
};

/**
 * Get specific slot machine details
 * @param {string} machineId - The ID of the machine to get details for
 * @returns {Promise} - The API response
 */
export const getMachineDetails = async (machineId) => {
  return axios.get(`${API_URL}/api/game/machine/${machineId}`);
};

/**
 * Claim daily bonus
 * @returns {Promise} - The API response
 */
export const claimDailyBonus = async () => {
  return axios.post(`${API_URL}/api/game/daily-bonus`);
};

/**
 * Get game leaderboard
 * @param {string} type - The type of leaderboard (winnings, spins, jackpots, biggestWin)
 * @param {number} limit - The number of entries to return
 * @returns {Promise} - The API response
 */
export const getLeaderboard = async (type = 'winnings', limit = 10) => {
  return axios.get(`${API_URL}/api/game/leaderboard?type=${type}&limit=${limit}`);
};

/**
 * Get user's game history
 * @param {number} page - The page number
 * @param {number} limit - The number of entries per page
 * @returns {Promise} - The API response
 */
export const getGameHistory = async (page = 1, limit = 10) => {
  return axios.get(`${API_URL}/api/game/history?page=${page}&limit=${limit}`);
};

/**
 * Start auto-spin session
 * @param {string} machineId - The ID of the machine to auto-spin
 * @param {number} betAmount - The amount to bet per spin
 * @param {number} spins - The number of spins to perform
 * @param {boolean} stopOnJackpot - Whether to stop on jackpot
 * @param {boolean} stopOnBigWin - Whether to stop on big win
 * @param {number} bigWinThreshold - The threshold for big win
 * @returns {Promise} - The API response
 */
export const startAutoSpin = async (
  machineId,
  betAmount,
  spins,
  stopOnJackpot = true,
  stopOnBigWin = false,
  bigWinThreshold = 0
) => {
  return axios.post(`${API_URL}/api/game/auto-spin`, {
    machineId,
    betAmount,
    spins,
    stopOnJackpot,
    stopOnBigWin,
    bigWinThreshold
  });
};

/**
 * Stop auto-spin session
 * @returns {Promise} - The API response
 */
export const stopAutoSpin = async () => {
  return axios.post(`${API_URL}/api/game/stop-auto-spin`);
};

/**
 * Get current jackpot amount
 * @returns {Promise} - The API response
 */
export const getJackpotAmount = async () => {
  return axios.get(`${API_URL}/api/game/jackpot`);
};

/**
 * Get slot machine symbols and payouts
 * @param {string} machineId - The ID of the machine to get symbols for
 * @returns {Promise} - The API response
 */
export const getSymbolsAndPayouts = async (machineId) => {
  return axios.get(`${API_URL}/api/game/symbols?machineId=${machineId}`);
};