const { validationResult } = require('express-validator');
const User = require('../models/User');
const Machine = require('../models/Machine');
const Transaction = require('../models/Transaction');
const GameSession = require('../models/GameSession');
const CryptoWallet = require('../models/CryptoWallet');
const Achievement = require('../models/Achievement');

/**
 * @desc    Spin the slot machine
 * @route   POST /api/game/spin
 * @access  Private
 */
exports.spinSlotMachine = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { betAmount, machineId } = req.body;

  try {
    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has enough coins
    if (user.gameBalance.coins < betAmount) {
      return res.status(400).json({ message: 'Insufficient coins' });
    }

    // Get machine
    const machine = await Machine.findOne({
      _id: machineId,
      owner: req.user.id
    });
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    // Check if bet amount is within machine limits
    if (betAmount < machine.attributes.minBet || betAmount > machine.attributes.maxBet) {
      return res.status(400).json({ 
        message: `Bet amount must be between ${machine.attributes.minBet} and ${machine.attributes.maxBet}` 
      });
    }

    // Get or create active game session
    let gameSession = await GameSession.findOne({
      user: req.user.id,
      machine: machineId,
      isActive: true
    });

    if (!gameSession) {
      gameSession = new GameSession({
        user: req.user.id,
        machine: machineId,
        balanceSnapshot: {
          startingCoins: user.gameBalance.coins,
          currentCoins: user.gameBalance.coins
        }
      });
      await gameSession.save();
    }

    // Generate spin result
    const spinResult = generateSpinResult(machine);
    
    // Calculate win amount
    const { winAmount, isWin, isJackpot, paylines, multiplier } = calculateWinAmount(
      spinResult, 
      betAmount, 
      machine
    );

    // Calculate crypto earned (if any)
    const cryptoEarned = isWin ? 
      calculateCryptoEarned(winAmount, machine.attributes.cryptoEarningRate) : 0;

    // Update user balance
    user.gameBalance.coins -= betAmount;
    if (isWin) {
      user.gameBalance.coins += winAmount;
    }

    // Update user stats
    user.gameStats.totalSpins += 1;
    user.gameStats.totalBets += betAmount;
    if (isWin) {
      user.gameStats.totalWins += 1;
      user.gameStats.totalWinnings += winAmount;
      if (winAmount > user.gameStats.biggestWin) {
        user.gameStats.biggestWin = winAmount;
      }
      if (isJackpot) {
        user.gameStats.jackpotsWon += 1;
      }
    } else {
      user.gameStats.totalLosses += 1;
    }

    // Update machine stats
    machine.stats.totalSpins += 1;
    if (isWin) {
      machine.stats.totalWins += 1;
      if (winAmount > machine.stats.biggestWin) {
        machine.stats.biggestWin = winAmount;
      }
      if (isJackpot) {
        machine.stats.jackpotsWon += 1;
      }
    } else {
      machine.stats.totalLosses += 1;
    }

    // Add crypto to user's wallet if earned
    if (cryptoEarned > 0) {
      // Find or create user's crypto wallet
      let wallet = await CryptoWallet.findOne({ user: req.user.id });
      if (!wallet) {
        wallet = new CryptoWallet({
          user: req.user.id,
          balances: [{ cryptoType: 'bitcoin', amount: 0 }]
        });
      }

      // Add crypto to wallet
      const btcBalance = wallet.balances.find(b => b.cryptoType === 'bitcoin');
      if (btcBalance) {
        btcBalance.amount += cryptoEarned;
      } else {
        wallet.balances.push({
          cryptoType: 'bitcoin',
          amount: cryptoEarned
        });
      }

      // Update wallet stats
      wallet.stats.totalEarned += cryptoEarned;
      
      await wallet.save();
    }

    // Record spin in game session
    gameSession.spins.push({
      betAmount,
      result: spinResult,
      winAmount,
      isWin,
      isJackpot,
      paylines,
      multiplier,
      cryptoEarned
    });

    // Update game session balance snapshot
    gameSession.balanceSnapshot.currentCoins = user.gameBalance.coins;

    // Create transaction record
    const transaction = new Transaction({
      user: req.user.id,
      type: isWin ? 'game_win' : 'game_loss',
      amount: isWin ? winAmount : betAmount,
      currency: 'coins',
      description: isWin ? 
        `Won ${winAmount} coins from slot machine spin` : 
        `Lost ${betAmount} coins from slot machine spin`,
      gameDetails: {
        machineId,
        betAmount,
        winAmount: isWin ? winAmount : 0,
        spinResult
      },
      balanceAfter: {
        coins: user.gameBalance.coins,
        tokens: user.gameBalance.tokens
      }
    });

    // Save all changes
    await user.save();
    await machine.save();
    await gameSession.save();
    await transaction.save();

    // Check for achievements
    const newAchievements = await checkForAchievements(req.user.id);

    // Return spin result
    res.json({
      spinResult,
      winAmount,
      isWin,
      isJackpot,
      paylines,
      multiplier,
      cryptoEarned,
      currentBalance: user.gameBalance,
      newAchievements
    });
  } catch (err) {
    console.error('Spin slot machine error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Get user's slot machines
 * @route   GET /api/game/machines
 * @access  Private
 */
exports.getUserMachines = async (req, res) => {
  try {
    const machines = await Machine.find({ owner: req.user.id });
    res.json(machines);
  } catch (err) {
    console.error('Get user machines error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Get specific slot machine details
 * @route   GET /api/game/machine/:id
 * @access  Private
 */
exports.getMachineDetails = async (req, res) => {
  try {
    const machine = await Machine.findOne({
      _id: req.params.id,
      owner: req.user.id
    });

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    res.json(machine);
  } catch (err) {
    console.error('Get machine details error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Claim daily bonus
 * @route   POST /api/game/daily-bonus
 * @access  Private
 */
exports.claimDailyBonus = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user has already claimed bonus today
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    if (user.dailyBonus && user.dailyBonus.lastClaimed) {
      const lastClaimed = new Date(user.dailyBonus.lastClaimed);
      const lastClaimedDate = new Date(
        lastClaimed.getFullYear(),
        lastClaimed.getMonth(),
        lastClaimed.getDate()
      );
      
      if (lastClaimedDate.getTime() === today.getTime()) {
        return res.status(400).json({ message: 'Daily bonus already claimed today' });
      }
      
      // Check if streak continues
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastClaimedDate.getTime() === yesterday.getTime()) {
        user.dailyBonus.streak += 1;
      } else {
        user.dailyBonus.streak = 1;
      }
    } else {
      user.dailyBonus = {
        lastClaimed: now,
        streak: 1
      };
    }
    
    // Calculate bonus amount based on streak
    const baseBonus = 100;
    const streakMultiplier = Math.min(2, 1 + (user.dailyBonus.streak * 0.1));
    const bonusAmount = Math.floor(baseBonus * streakMultiplier);
    
    // Update user balance
    user.gameBalance.coins += bonusAmount;
    user.dailyBonus.lastClaimed = now;
    
    // Create transaction record
    const transaction = new Transaction({
      user: req.user.id,
      type: 'daily_bonus',
      amount: bonusAmount,
      currency: 'coins',
      description: `Daily bonus: ${bonusAmount} coins (Day ${user.dailyBonus.streak})`,
      balanceAfter: {
        coins: user.gameBalance.coins,
        tokens: user.gameBalance.tokens
      }
    });
    
    await user.save();
    await transaction.save();
    
    res.json({
      bonusAmount,
      streak: user.dailyBonus.streak,
      nextBonusAvailable: new Date(today.getTime() + 86400000), // Tomorrow
      currentBalance: user.gameBalance
    });
  } catch (err) {
    console.error('Claim daily bonus error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Get game leaderboard
 * @route   GET /api/game/leaderboard
 * @access  Private
 */
exports.getLeaderboard = async (req, res) => {
  try {
    const { type = 'winnings', limit = 10 } = req.query;
    
    let sortField;
    switch (type) {
      case 'winnings':
        sortField = 'gameStats.totalWinnings';
        break;
      case 'spins':
        sortField = 'gameStats.totalSpins';
        break;
      case 'jackpots':
        sortField = 'gameStats.jackpotsWon';
        break;
      case 'biggestWin':
        sortField = 'gameStats.biggestWin';
        break;
      default:
        sortField = 'gameStats.totalWinnings';
    }
    
    const leaderboard = await User.find({}, {
      username: 1,
      avatar: 1,
      gameStats: 1
    })
    .sort({ [sortField]: -1 })
    .limit(parseInt(limit));
    
    res.json(leaderboard);
  } catch (err) {
    console.error('Get leaderboard error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Get user's game history
 * @route   GET /api/game/history
 * @access  Private
 */
exports.getGameHistory = async (req, res) => {
  try {
    const { limit = 10, page = 1 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const sessions = await GameSession.find({
      user: req.user.id
    })
    .sort({ startTime: -1 })
    .skip(skip)
    .limit(parseInt(limit));
    
    const total = await GameSession.countDocuments({ user: req.user.id });
    
    res.json({
      sessions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('Get game history error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Start auto-spin session
 * @route   POST /api/game/auto-spin
 * @access  Private
 */
exports.startAutoSpin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { betAmount, spins, machineId } = req.body;
  const { stopOnJackpot = true, stopOnBigWin = false, bigWinThreshold = 0 } = req.body;
  
  try {
    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user has enough coins for all spins
    if (user.gameBalance.coins < betAmount * spins) {
      return res.status(400).json({ message: 'Insufficient coins for auto-spin session' });
    }
    
    // Get machine
    const machine = await Machine.findOne({
      _id: machineId,
      owner: req.user.id
    });
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }
    
    // Check if bet amount is within machine limits
    if (betAmount < machine.attributes.minBet || betAmount > machine.attributes.maxBet) {
      return res.status(400).json({ 
        message: `Bet amount must be between ${machine.attributes.minBet} and ${machine.attributes.maxBet}` 
      });
    }
    
    // Get or create active game session
    let gameSession = await GameSession.findOne({
      user: req.user.id,
      machine: machineId,
      isActive: true
    });
    
    if (!gameSession) {
      gameSession = new GameSession({
        user: req.user.id,
        machine: machineId,
        balanceSnapshot: {
          startingCoins: user.gameBalance.coins,
          currentCoins: user.gameBalance.coins
        }
      });
    }
    
    // Set auto-spin settings
    gameSession.autoSpinSettings = {
      isActive: true,
      spinsRemaining: spins,
      betAmount,
      stopOnJackpot,
      stopOnBigWin,
      bigWinThreshold
    };
    
    await gameSession.save();
    
    // Return first spin result
    const spinResult = await processSingleSpin(
      req.user.id,
      machineId,
      betAmount,
      gameSession
    );
    
    // Update auto-spin settings
    gameSession.autoSpinSettings.spinsRemaining -= 1;
    
    // Check if auto-spin should stop
    if (
      gameSession.autoSpinSettings.spinsRemaining <= 0 ||
      (stopOnJackpot && spinResult.isJackpot) ||
      (stopOnBigWin && spinResult.winAmount >= bigWinThreshold)
    ) {
      gameSession.autoSpinSettings.isActive = false;
    }
    
    await gameSession.save();
    
    res.json({
      ...spinResult,
      autoSpin: {
        active: gameSession.autoSpinSettings.isActive,
        remaining: gameSession.autoSpinSettings.spinsRemaining
      }
    });
  } catch (err) {
    console.error('Start auto-spin error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Stop auto-spin session
 * @route   POST /api/game/stop-auto-spin
 * @access  Private
 */
exports.stopAutoSpin = async (req, res) => {
  try {
    // Find active game session with auto-spin
    const gameSession = await GameSession.findOne({
      user: req.user.id,
      isActive: true,
      'autoSpinSettings.isActive': true
    });
    
    if (!gameSession) {
      return res.status(404).json({ message: 'No active auto-spin session found' });
    }
    
    // Stop auto-spin
    gameSession.autoSpinSettings.isActive = false;
    await gameSession.save();
    
    res.json({
      message: 'Auto-spin stopped successfully',
      spinsRemaining: gameSession.autoSpinSettings.spinsRemaining
    });
  } catch (err) {
    console.error('Stop auto-spin error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Get current jackpot amount
 * @route   GET /api/game/jackpot
 * @access  Private
 */
exports.getJackpotAmount = async (req, res) => {
  try {
    // In a real implementation, this would fetch from a global jackpot pool
    // For this example, we'll generate a random jackpot amount
    const baseJackpot = 10000;
    const randomMultiplier = 1 + (Math.random() * 9);
    const jackpotAmount = Math.floor(baseJackpot * randomMultiplier);
    
    res.json({
      jackpotAmount,
      lastUpdated: new Date()
    });
  } catch (err) {
    console.error('Get jackpot amount error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Get slot machine symbols and payouts
 * @route   GET /api/game/symbols
 * @access  Private
 */
exports.getSymbolsAndPayouts = async (req, res) => {
  try {
    const { machineId } = req.query;
    
    // Get machine if ID provided
    let symbolSet = 'classic';
    if (machineId) {
      const machine = await Machine.findOne({
        _id: machineId,
        owner: req.user.id
      });
      
      if (machine) {
        symbolSet = machine.symbolSet;
      }
    }
    
    // Get symbols and payouts based on symbol set
    const symbols = getSymbolsForSet(symbolSet);
    
    res.json(symbols);
  } catch (err) {
    console.error('Get symbols error:', err.message);
    res.status(500).send('Server error');
  }
};

// Helper functions

/**
 * Generate a random spin result based on machine configuration
 */
function generateSpinResult(machine) {
  const reels = machine.attributes.reels;
  const symbolSet = getSymbolsForSet(machine.symbolSet);
  const symbols = symbolSet.map(s => s.symbol);
  
  // Generate random result
  const result = [];
  for (let i = 0; i < reels; i++) {
    const randomIndex = Math.floor(Math.random() * symbols.length);
    result.push(symbols[randomIndex]);
  }
  
  return result;
}

/**
 * Calculate win amount based on spin result
 */
function calculateWinAmount(spinResult, betAmount, machine) {
  const symbolSet = getSymbolsForSet(machine.symbolSet);
  const payoutMultiplier = machine.attributes.payoutMultiplier;
  
  // Check for winning combinations
  let winAmount = 0;
  let isWin = false;
  let isJackpot = false;
  let multiplier = 1;
  const paylines = [];
  
  // Simple win check for matching symbols
  const firstSymbol = spinResult[0];
  const allMatch = spinResult.every(symbol => symbol === firstSymbol);
  
  if (allMatch) {
    const symbolInfo = symbolSet.find(s => s.symbol === firstSymbol);
    if (symbolInfo) {
      winAmount = betAmount * symbolInfo.payout * payoutMultiplier;
      isWin = true;
      
      // Check for jackpot
      if (symbolInfo.isJackpot) {
        isJackpot = true;
        multiplier = 10; // Jackpot multiplier
        winAmount *= multiplier;
      }
      
      paylines.push({
        line: Array.from({ length: spinResult.length }, (_, i) => i),
        symbols: spinResult,
        payout: winAmount
      });
    }
  }
  
  return { winAmount, isWin, isJackpot, paylines, multiplier };
}

/**
 * Calculate crypto earned from a win
 */
function calculateCryptoEarned(winAmount, cryptoEarningRate) {
  // Convert a percentage of winnings to crypto
  // This is a simplified calculation
  return winAmount * cryptoEarningRate / 10000; // Divide by 10000 to get a small BTC amount
}

/**
 * Get symbols for a specific symbol set
 */
function getSymbolsForSet(symbolSet) {
  // Define symbol sets with payouts
  const symbolSets = {
    classic: [
      { symbol: '7', payout: 10, isJackpot: true },
      { symbol: 'BAR', payout: 5, isJackpot: false },
      { symbol: 'Cherry', payout: 3, isJackpot: false },
      { symbol: 'Lemon', payout: 2, isJackpot: false },
      { symbol: 'Orange', payout: 2, isJackpot: false }
    ],
    fruits: [
      { symbol: 'Strawberry', payout: 10, isJackpot: true },
      { symbol: 'Watermelon', payout: 5, isJackpot: false },
      { symbol: 'Grape', payout: 3, isJackpot: false },
      { symbol: 'Banana', payout: 2, isJackpot: false },
      { symbol: 'Pineapple', payout: 2, isJackpot: false }
    ],
    crypto: [
      { symbol: 'Bitcoin', payout: 10, isJackpot: true },
      { symbol: 'Ethereum', payout: 5, isJackpot: false },
      { symbol: 'Litecoin', payout: 3, isJackpot: false },
      { symbol: 'Dogecoin', payout: 2, isJackpot: false },
      { symbol: 'Ripple', payout: 2, isJackpot: false }
    ]
  };
  
  return symbolSets[symbolSet] || symbolSets.classic;
}

/**
 * Check for achievements after a spin
 */
async function checkForAchievements(userId) {
  try {
    const user = await User.findById(userId);
    if (!user) return [];
    
    const achievements = await Achievement.find({
      _id: { $nin: user.achievements.map(a => a.achievementId) }
    });
    
    const newAchievements = [];
    
    for (const achievement of achievements) {
      let completed = false;
      
      switch (achievement.requirement.type) {
        case 'total_spins':
          completed = user.gameStats.totalSpins >= achievement.requirement.value;
          break;
        case 'total_wins':
          completed = user.gameStats.totalWins >= achievement.requirement.value;
          break;
        case 'total_coins_won':
          completed = user.gameStats.totalWinnings >= achievement.requirement.value;
          break;
        case 'jackpot_wins':
          completed = user.gameStats.jackpotsWon >= achievement.requirement.value;
          break;
        // Add more achievement types as needed
      }
      
      if (completed) {
        // Add achievement to user
        user.achievements.push({
          achievementId: achievement._id,
          completed: true,
          progress: achievement.requirement.value
        });
        
        // Add reward to user
        if (achievement.reward.type === 'coins') {
          user.gameBalance.coins += achievement.reward.value;
          
          // Create transaction for reward
          const transaction = new Transaction({
            user: userId,
            type: 'achievement_reward',
            amount: achievement.reward.value,
            currency: 'coins',
            description: `Achievement reward: ${achievement.name}`,
            balanceAfter: {
              coins: user.gameBalance.coins,
              tokens: user.gameBalance.tokens
            }
          });
          
          await transaction.save();
        }
        
        newAchievements.push({
          ...achievement.toObject(),
          reward: {
            type: achievement.reward.type,
            value: achievement.reward.value
          }
        });
      }
    }
    
    if (newAchievements.length > 0) {
      await user.save();
    }
    
    return newAchievements;
  } catch (err) {
    console.error('Check achievements error:', err.message);
    return [];
  }
}

/**
 * Process a single spin for auto-spin
 */
async function processSingleSpin(userId, machineId, betAmount, gameSession) {
  // Get user
  const user = await User.findById(userId);
  
  // Get machine
  const machine = await Machine.findById(machineId);
  
  // Generate spin result
  const spinResult = generateSpinResult(machine);
  
  // Calculate win amount
  const { winAmount, isWin, isJackpot, paylines, multiplier } = calculateWinAmount(
    spinResult, 
    betAmount, 
    machine
  );
  
  // Calculate crypto earned (if any)
  const cryptoEarned = isWin ? 
    calculateCryptoEarned(winAmount, machine.attributes.cryptoEarningRate) : 0;
  
  // Update user balance
  user.gameBalance.coins -= betAmount;
  if (isWin) {
    user.gameBalance.coins += winAmount;
  }
  
  // Update user stats
  user.gameStats.totalSpins += 1;
  user.gameStats.totalBets += betAmount;
  if (isWin) {
    user.gameStats.totalWins += 1;
    user.gameStats.totalWinnings += winAmount;
    if (winAmount > user.gameStats.biggestWin) {
      user.gameStats.biggestWin = winAmount;
    }
    if (isJackpot) {
      user.gameStats.jackpotsWon += 1;
    }
  } else {
    user.gameStats.totalLosses += 1;
  }
  
  // Update machine stats
  machine.stats.totalSpins += 1;
  if (isWin) {
    machine.stats.totalWins += 1;
    if (winAmount > machine.stats.biggestWin) {
      machine.stats.biggestWin = winAmount;
    }
    if (isJackpot) {
      machine.stats.jackpotsWon += 1;
    }
  } else {
    machine.stats.totalLosses += 1;
  }
  
  // Add crypto to user's wallet if earned
  if (cryptoEarned > 0) {
    // Find or create user's crypto wallet
    let wallet = await CryptoWallet.findOne({ user: userId });
    if (!wallet) {
      wallet = new CryptoWallet({
        user: userId,
        balances: [{ cryptoType: 'bitcoin', amount: 0 }]
      });
    }
    
    // Add crypto to wallet
    const btcBalance = wallet.balances.find(b => b.cryptoType === 'bitcoin');
    if (btcBalance) {
      btcBalance.amount += cryptoEarned;
    } else {
      wallet.balances.push({
        cryptoType: 'bitcoin',
        amount: cryptoEarned
      });
    }
    
    // Update wallet stats
    wallet.stats.totalEarned += cryptoEarned;
    
    await wallet.save();
  }
  
  // Record spin in game session
  gameSession.spins.push({
    betAmount,
    result: spinResult,
    winAmount,
    isWin,
    isJackpot,
    paylines,
    multiplier,
    cryptoEarned
  });
  
  // Update game session balance snapshot
  gameSession.balanceSnapshot.currentCoins = user.gameBalance.coins;
  
  // Create transaction record
  const transaction = new Transaction({
    user: userId,
    type: isWin ? 'game_win' : 'game_loss',
    amount: isWin ? winAmount : betAmount,
    currency: 'coins',
    description: isWin ? 
      `Won ${winAmount} coins from slot machine spin` : 
      `Lost ${betAmount} coins from slot machine spin`,
    gameDetails: {
      machineId,
      betAmount,
      winAmount: isWin ? winAmount : 0,
      spinResult
    },
    balanceAfter: {
      coins: user.gameBalance.coins,
      tokens: user.gameBalance.tokens
    }
  });
  
  // Save all changes
  await user.save();
  await machine.save();
  await transaction.save();
  
  // Check for achievements
  const newAchievements = await checkForAchievements(userId);
  
  return {
    spinResult,
    winAmount,
    isWin,
    isJackpot,
    paylines,
    multiplier,
    cryptoEarned,
    currentBalance: user.gameBalance,
    newAchievements
  };
}