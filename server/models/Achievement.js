const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AchievementSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['gameplay', 'progression', 'collection', 'social', 'crypto', 'special'],
    required: true
  },
  icon: {
    type: String,
    default: 'default-achievement.png'
  },
  requirement: {
    type: {
      type: String,
      enum: [
        'total_spins',
        'total_wins',
        'total_coins_won',
        'jackpot_wins',
        'machine_level',
        'machines_owned',
        'upgrades_purchased',
        'crypto_earned',
        'login_days',
        'consecutive_login_days',
        'referrals',
        'special_combinations',
        'custom'
      ],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    additionalParams: {
      type: Object
    }
  },
  reward: {
    type: {
      type: String,
      enum: ['coins', 'tokens', 'crypto', 'upgrade', 'machine', 'special'],
      required: true
    },
    value: {
      type: Number,
      required: true
    },
    additionalParams: {
      type: Object
    }
  },
  tier: {
    type: Number,
    enum: [1, 2, 3, 4, 5],
    default: 1
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },
  isSecret: {
    type: Boolean,
    default: false
  },
  isLimited: {
    type: Boolean,
    default: false
  },
  limitedTimeStart: {
    type: Date
  },
  limitedTimeEnd: {
    type: Date
  },
  prerequisiteAchievements: [{
    type: Schema.Types.ObjectId,
    ref: 'Achievement'
  }],
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
AchievementSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Achievement', AchievementSchema);