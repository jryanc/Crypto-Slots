const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: [
      'game_win',
      'game_loss',
      'purchase_upgrade',
      'sell_upgrade',
      'purchase_machine',
      'sell_machine',
      'crypto_purchase',
      'crypto_sale',
      'crypto_deposit',
      'crypto_withdrawal',
      'crypto_conversion',
      'daily_bonus',
      'achievement_reward',
      'in_app_purchase',
      'referral_bonus',
      'admin_adjustment'
    ],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    enum: ['coins', 'tokens', 'bitcoin', 'ethereum', 'usd', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'cancelled'],
    default: 'completed'
  },
  gameDetails: {
    machineId: {
      type: Schema.Types.ObjectId,
      ref: 'Machine'
    },
    betAmount: {
      type: Number
    },
    winAmount: {
      type: Number
    },
    spinResult: {
      type: [String]
    }
  },
  upgradeDetails: {
    upgradeId: {
      type: Schema.Types.ObjectId,
      ref: 'Upgrade'
    },
    machineId: {
      type: Schema.Types.ObjectId,
      ref: 'Machine'
    }
  },
  cryptoDetails: {
    cryptoType: {
      type: String
    },
    amount: {
      type: Number
    },
    price: {
      type: Number
    },
    walletAddress: {
      type: String
    },
    transactionHash: {
      type: String
    },
    fromCrypto: {
      type: String
    },
    toCrypto: {
      type: String
    },
    conversionRate: {
      type: Number
    }
  },
  purchaseDetails: {
    productId: {
      type: String
    },
    platform: {
      type: String,
      enum: ['ios', 'android', 'web']
    },
    receiptId: {
      type: String
    },
    amount: {
      type: Number
    },
    currency: {
      type: String
    }
  },
  balanceAfter: {
    coins: {
      type: Number
    },
    tokens: {
      type: Number
    },
    crypto: {
      type: Object
    }
  },
  transactionFee: {
    amount: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      enum: ['coins', 'tokens', 'bitcoin', 'ethereum', 'usd', 'other']
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
TransactionSchema.index({ user: 1, createdAt: -1 });
TransactionSchema.index({ type: 1, createdAt: -1 });

module.exports = mongoose.model('Transaction', TransactionSchema);