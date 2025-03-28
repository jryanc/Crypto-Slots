const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UpgradeSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['payout', 'speed', 'reels', 'paylines', 'special', 'crypto', 'visual'],
    required: true
  },
  tier: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  price: {
    type: Number,
    required: true
  },
  image: {
    type: String,
    default: 'default-upgrade.png'
  },
  effects: {
    payoutMultiplier: {
      type: Number,
      default: 0
    },
    winRate: {
      type: Number,
      default: 0
    },
    spinSpeed: {
      type: Number,
      default: 0
    },
    reels: {
      type: Number,
      default: 0
    },
    paylines: {
      type: Number,
      default: 0
    },
    minBet: {
      type: Number,
      default: 0
    },
    maxBet: {
      type: Number,
      default: 0
    },
    cryptoEarningRate: {
      type: Number,
      default: 0
    }
  },
  specialFeature: {
    name: {
      type: String
    },
    description: {
      type: String
    },
    effect: {
      type: String
    }
  },
  compatibleMachines: [{
    type: String,
    enum: ['basic', 'premium', 'deluxe', 'crypto', 'jackpot', 'all']
  }],
  requirements: {
    playerLevel: {
      type: Number,
      default: 1
    },
    machineLevel: {
      type: Number,
      default: 1
    },
    previousUpgrades: [{
      type: Schema.Types.ObjectId,
      ref: 'Upgrade'
    }]
  },
  durability: {
    type: Number,
    default: -1 // -1 means permanent
  },
  sellValue: {
    type: Number,
    default: 0 // Value when sold back to the system
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
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
UpgradeSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Upgrade', UpgradeSchema);