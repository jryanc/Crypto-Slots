const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MachineSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  level: {
    type: Number,
    default: 1
  },
  type: {
    type: String,
    enum: ['basic', 'premium', 'deluxe', 'crypto', 'jackpot'],
    default: 'basic'
  },
  image: {
    type: String,
    default: 'default-machine.png'
  },
  stats: {
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
    jackpotsWon: {
      type: Number,
      default: 0
    }
  },
  attributes: {
    payoutMultiplier: {
      type: Number,
      default: 1.0
    },
    winRate: {
      type: Number,
      default: 0.3 // 30% win rate
    },
    spinSpeed: {
      type: Number,
      default: 1.0 // Normal speed
    },
    reels: {
      type: Number,
      default: 3
    },
    paylines: {
      type: Number,
      default: 1
    },
    minBet: {
      type: Number,
      default: 10
    },
    maxBet: {
      type: Number,
      default: 100
    },
    cryptoEarningRate: {
      type: Number,
      default: 0.01 // 1% of winnings converted to crypto
    },
    specialFeatures: [{
      name: {
        type: String
      },
      description: {
        type: String
      },
      enabled: {
        type: Boolean,
        default: false
      }
    }]
  },
  upgrades: [{
    upgradeId: {
      type: Schema.Types.ObjectId,
      ref: 'Upgrade'
    },
    installedAt: {
      type: Date,
      default: Date.now
    },
    active: {
      type: Boolean,
      default: true
    }
  }],
  symbolSet: {
    type: String,
    enum: ['classic', 'fruits', 'gems', 'crypto', 'space', 'custom'],
    default: 'classic'
  },
  theme: {
    type: String,
    enum: ['classic', 'neon', 'futuristic', 'retro', 'luxury', 'crypto'],
    default: 'classic'
  },
  unlockRequirements: {
    playerLevel: {
      type: Number,
      default: 1
    },
    coinsRequired: {
      type: Number,
      default: 0
    },
    previousMachine: {
      type: Schema.Types.ObjectId,
      ref: 'Machine'
    }
  },
  isActive: {
    type: Boolean,
    default: true
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
MachineSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Machine', MachineSchema);