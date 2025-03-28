const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  avatar: {
    type: String
  },
  gameBalance: {
    coins: {
      type: Number,
      default: 1000 // Default starting coins
    },
    tokens: {
      type: Number,
      default: 0
    }
  },
  cryptoWallet: {
    connected: {
      type: Boolean,
      default: false
    },
    address: {
      type: String
    },
    type: {
      type: String,
      enum: ['ethereum', 'bitcoin', 'binance', 'other']
    }
  },
  cryptoBalances: [{
    cryptoType: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      default: 0
    },
    purchaseHistory: [{
      amount: Number,
      price: Number,
      date: {
        type: Date,
        default: Date.now
      }
    }]
  }],
  machines: [{
    type: Schema.Types.ObjectId,
    ref: 'Machine'
  }],
  upgrades: [{
    upgradeId: {
      type: Schema.Types.ObjectId,
      ref: 'Upgrade'
    },
    purchaseDate: {
      type: Date,
      default: Date.now
    },
    applied: {
      type: Boolean,
      default: false
    },
    appliedTo: {
      type: Schema.Types.ObjectId,
      ref: 'Machine'
    }
  }],
  gameStats: {
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
    biggestWin: {
      type: Number,
      default: 0
    },
    totalWinnings: {
      type: Number,
      default: 0
    },
    totalBets: {
      type: Number,
      default: 0
    },
    jackpotsWon: {
      type: Number,
      default: 0
    }
  },
  achievements: [{
    achievementId: {
      type: Schema.Types.ObjectId,
      ref: 'Achievement'
    },
    dateUnlocked: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 0
    },
    completed: {
      type: Boolean,
      default: false
    }
  }],
  dailyBonus: {
    lastClaimed: {
      type: Date
    },
    streak: {
      type: Number,
      default: 0
    }
  },
  twoFactorAuth: {
    enabled: {
      type: Boolean,
      default: false
    },
    secret: {
      type: String
    },
    backupCodes: [String]
  },
  notifications: {
    email: {
      type: Boolean,
      default: true
    },
    push: {
      type: Boolean,
      default: true
    }
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'moderator'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field on save
UserSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('User', UserSchema);