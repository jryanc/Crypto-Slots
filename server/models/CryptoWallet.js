const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CryptoWalletSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  balances: [{
    cryptoType: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      default: 0
    }
  }],
  externalWallets: [{
    name: {
      type: String,
      required: true
    },
    address: {
      type: String,
      required: true
    },
    walletType: {
      type: String,
      enum: ['ethereum', 'bitcoin', 'binance', 'other'],
      required: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    verificationDate: {
      type: Date
    }
  }],
  transactions: [{
    type: Schema.Types.ObjectId,
    ref: 'Transaction'
  }],
  investmentPortfolio: [{
    cryptoType: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    purchasePrice: {
      type: Number,
      required: true
    },
    purchaseDate: {
      type: Date,
      default: Date.now
    },
    currentValue: {
      type: Number
    },
    lastUpdated: {
      type: Date
    }
  }],
  settings: {
    autoInvest: {
      enabled: {
        type: Boolean,
        default: false
      },
      percentage: {
        type: Number,
        default: 5 // 5% of winnings
      },
      cryptoType: {
        type: String,
        default: 'bitcoin'
      },
      minAmount: {
        type: Number,
        default: 10 // Minimum coins to convert
      }
    },
    notifications: {
      priceAlerts: {
        type: Boolean,
        default: true
      },
      transactionAlerts: {
        type: Boolean,
        default: true
      }
    },
    securityLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium'
    }
  },
  stats: {
    totalDeposited: {
      type: Number,
      default: 0
    },
    totalWithdrawn: {
      type: Number,
      default: 0
    },
    totalInvested: {
      type: Number,
      default: 0
    },
    totalEarned: {
      type: Number,
      default: 0
    },
    profitLoss: {
      type: Number,
      default: 0
    }
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Update the lastUpdated field on save
CryptoWalletSchema.pre('save', function(next) {
  this.lastUpdated = Date.now();
  next();
});

// Calculate profit/loss before saving
CryptoWalletSchema.pre('save', function(next) {
  if (this.investmentPortfolio && this.investmentPortfolio.length > 0) {
    let totalInvested = 0;
    let totalCurrentValue = 0;
    
    this.investmentPortfolio.forEach(investment => {
      totalInvested += investment.amount * investment.purchasePrice;
      totalCurrentValue += investment.amount * (investment.currentValue || investment.purchasePrice);
    });
    
    this.stats.totalInvested = totalInvested;
    this.stats.profitLoss = totalCurrentValue - totalInvested;
  }
  
  next();
});

module.exports = mongoose.model('CryptoWallet', CryptoWalletSchema);