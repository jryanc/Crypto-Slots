const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const GameSessionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  machine: {
    type: Schema.Types.ObjectId,
    ref: 'Machine',
    required: true
  },
  startTime: {
    type: Date,
    default: Date.now
  },
  endTime: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sessionStats: {
    totalSpins: {
      type: Number,
      default: 0
    },
    totalWins: {
      type: Number,
      default: 0
    },
    totalLosses: {
      type: Number,
      default: 0
    },
    totalBet: {
      type: Number,
      default: 0
    },
    totalWinnings: {
      type: Number,
      default: 0
    },
    netProfit: {
      type: Number,
      default: 0
    },
    biggestWin: {
      type: Number,
      default: 0
    },
    jackpotsWon: {
      type: Number,
      default: 0
    },
    cryptoEarned: {
      type: Number,
      default: 0
    }
  },
  spins: [{
    timestamp: {
      type: Date,
      default: Date.now
    },
    betAmount: {
      type: Number,
      required: true
    },
    result: {
      type: [String],
      required: true
    },
    winAmount: {
      type: Number,
      default: 0
    },
    isWin: {
      type: Boolean,
      required: true
    },
    isJackpot: {
      type: Boolean,
      default: false
    },
    paylines: [{
      line: [Number],
      symbols: [String],
      payout: Number
    }],
    multiplier: {
      type: Number,
      default: 1
    },
    cryptoEarned: {
      type: Number,
      default: 0
    },
    specialFeatures: [{
      name: String,
      description: String,
      effect: String
    }]
  }],
  autoSpinSettings: {
    isActive: {
      type: Boolean,
      default: false
    },
    spinsRemaining: {
      type: Number,
      default: 0
    },
    betAmount: {
      type: Number
    },
    stopOnJackpot: {
      type: Boolean,
      default: true
    },
    stopOnBigWin: {
      type: Boolean,
      default: false
    },
    bigWinThreshold: {
      type: Number
    }
  },
  balanceSnapshot: {
    startingCoins: {
      type: Number
    },
    currentCoins: {
      type: Number
    },
    startingCrypto: {
      type: Object
    },
    currentCrypto: {
      type: Object
    }
  },
  achievements: [{
    achievementId: {
      type: Schema.Types.ObjectId,
      ref: 'Achievement'
    },
    unlockedDuringSession: {
      type: Boolean,
      default: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  upgrades: [{
    upgradeId: {
      type: Schema.Types.ObjectId,
      ref: 'Upgrade'
    },
    purchasedDuringSession: {
      type: Boolean,
      default: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  deviceInfo: {
    deviceType: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop', 'other']
    },
    platform: {
      type: String,
      enum: ['ios', 'android', 'web', 'other']
    },
    browser: String,
    ip: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate session statistics before saving
GameSessionSchema.pre('save', function(next) {
  if (this.spins && this.spins.length > 0) {
    let totalBet = 0;
    let totalWinnings = 0;
    let biggestWin = 0;
    let jackpotsWon = 0;
    let cryptoEarned = 0;
    
    this.spins.forEach(spin => {
      totalBet += spin.betAmount;
      totalWinnings += spin.winAmount;
      
      if (spin.winAmount > biggestWin) {
        biggestWin = spin.winAmount;
      }
      
      if (spin.isJackpot) {
        jackpotsWon++;
      }
      
      if (spin.cryptoEarned) {
        cryptoEarned += spin.cryptoEarned;
      }
    });
    
    this.sessionStats.totalSpins = this.spins.length;
    this.sessionStats.totalWins = this.spins.filter(spin => spin.isWin).length;
    this.sessionStats.totalLosses = this.spins.filter(spin => !spin.isWin).length;
    this.sessionStats.totalBet = totalBet;
    this.sessionStats.totalWinnings = totalWinnings;
    this.sessionStats.netProfit = totalWinnings - totalBet;
    this.sessionStats.biggestWin = biggestWin;
    this.sessionStats.jackpotsWon = jackpotsWon;
    this.sessionStats.cryptoEarned = cryptoEarned;
  }
  
  next();
});

// Set endTime when session is no longer active
GameSessionSchema.pre('save', function(next) {
  if (this.isModified('isActive') && !this.isActive && !this.endTime) {
    this.endTime = Date.now();
  }
  next();
});

module.exports = mongoose.model('GameSession', GameSessionSchema);