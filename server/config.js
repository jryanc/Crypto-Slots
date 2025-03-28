// Game Configuration
exports.GAME_CONFIG = {
  DEFAULT_STARTING_COINS: 1000,
  MIN_BET_AMOUNT: 10,
  MAX_BET_AMOUNT: 1000,
  TRANSACTION_FEE_PERCENTAGE: 1,
  DAILY_BONUS: {
    BASE_AMOUNT: 100,
    MAX_STREAK_MULTIPLIER: 2
  }
};

// Upgrade Categories
exports.UPGRADE_CATEGORIES = [
  {
    id: 'payout',
    name: 'Payout Upgrades',
    description: 'Increase your winnings',
    icon: 'cash'
  },
  {
    id: 'speed',
    name: 'Speed Upgrades',
    description: 'Spin faster',
    icon: 'speedometer'
  },
  {
    id: 'reels',
    name: 'Reel Upgrades',
    description: 'Add more reels for more combinations',
    icon: 'apps'
  },
  {
    id: 'paylines',
    name: 'Payline Upgrades',
    description: 'Add more paylines for more chances to win',
    icon: 'git-network'
  },
  {
    id: 'special',
    name: 'Special Feature Upgrades',
    description: 'Add special features to your machine',
    icon: 'star'
  },
  {
    id: 'crypto',
    name: 'Crypto Upgrades',
    description: 'Increase crypto earnings',
    icon: 'logo-bitcoin'
  },
  {
    id: 'visual',
    name: 'Visual Upgrades',
    description: 'Customize your machine appearance',
    icon: 'color-palette'
  }
];

// Machine Types
exports.MACHINE_TYPES = [
  {
    id: 'basic',
    name: 'Basic Slot Machine',
    description: 'A simple slot machine with basic features',
    minLevel: 1,
    price: 0, // Free starter machine
    image: 'basic-machine.png'
  },
  {
    id: 'premium',
    name: 'Premium Slot Machine',
    description: 'A premium slot machine with better odds',
    minLevel: 5,
    price: 5000,
    image: 'premium-machine.png'
  },
  {
    id: 'deluxe',
    name: 'Deluxe Slot Machine',
    description: 'A deluxe slot machine with special features',
    minLevel: 10,
    price: 15000,
    image: 'deluxe-machine.png'
  },
  {
    id: 'crypto',
    name: 'Crypto Slot Machine',
    description: 'A slot machine that generates more crypto rewards',
    minLevel: 15,
    price: 30000,
    image: 'crypto-machine.png'
  },
  {
    id: 'jackpot',
    name: 'Jackpot Slot Machine',
    description: 'A slot machine with increased jackpot chances',
    minLevel: 20,
    price: 50000,
    image: 'jackpot-machine.png'
  }
];

// Symbol Sets
exports.SYMBOL_SETS = {
  classic: [
    { symbol: '7', payout: 10, isJackpot: true, image: 'seven.png' },
    { symbol: 'BAR', payout: 5, isJackpot: false, image: 'bar.png' },
    { symbol: 'Cherry', payout: 3, isJackpot: false, image: 'cherry.png' },
    { symbol: 'Lemon', payout: 2, isJackpot: false, image: 'lemon.png' },
    { symbol: 'Orange', payout: 2, isJackpot: false, image: 'orange.png' }
  ],
  fruits: [
    { symbol: 'Strawberry', payout: 10, isJackpot: true, image: 'strawberry.png' },
    { symbol: 'Watermelon', payout: 5, isJackpot: false, image: 'watermelon.png' },
    { symbol: 'Grape', payout: 3, isJackpot: false, image: 'grape.png' },
    { symbol: 'Banana', payout: 2, isJackpot: false, image: 'banana.png' },
    { symbol: 'Pineapple', payout: 2, isJackpot: false, image: 'pineapple.png' }
  ],
  crypto: [
    { symbol: 'Bitcoin', payout: 10, isJackpot: true, image: 'bitcoin.png' },
    { symbol: 'Ethereum', payout: 5, isJackpot: false, image: 'ethereum.png' },
    { symbol: 'Litecoin', payout: 3, isJackpot: false, image: 'litecoin.png' },
    { symbol: 'Dogecoin', payout: 2, isJackpot: false, image: 'dogecoin.png' },
    { symbol: 'Ripple', payout: 2, isJackpot: false, image: 'ripple.png' }
  ]
};

// Crypto Configuration
exports.CRYPTO_CONFIG = {
  SUPPORTED_CRYPTOS: [
    {
      id: 'bitcoin',
      name: 'Bitcoin',
      symbol: 'BTC',
      icon: 'bitcoin',
      color: '#F7931A'
    },
    {
      id: 'ethereum',
      name: 'Ethereum',
      symbol: 'ETH',
      icon: 'ethereum',
      color: '#627EEA'
    },
    {
      id: 'litecoin',
      name: 'Litecoin',
      symbol: 'LTC',
      icon: 'litecoin',
      color: '#BFBBBB'
    },
    {
      id: 'dogecoin',
      name: 'Dogecoin',
      symbol: 'DOGE',
      icon: 'dogecoin',
      color: '#C2A633'
    },
    {
      id: 'ripple',
      name: 'Ripple',
      symbol: 'XRP',
      icon: 'ripple',
      color: '#0085C0'
    }
  ],
  TRANSACTION_FEE_PERCENTAGE: 1,
  COINS_PER_DOLLAR: 100 // 100 coins = $1 USD
};

// Achievement Categories
exports.ACHIEVEMENT_CATEGORIES = [
  {
    id: 'gameplay',
    name: 'Gameplay Achievements',
    icon: 'game-controller'
  },
  {
    id: 'progression',
    name: 'Progression Achievements',
    icon: 'trending-up'
  },
  {
    id: 'collection',
    name: 'Collection Achievements',
    icon: 'albums'
  },
  {
    id: 'social',
    name: 'Social Achievements',
    icon: 'people'
  },
  {
    id: 'crypto',
    name: 'Crypto Achievements',
    icon: 'logo-bitcoin'
  },
  {
    id: 'special',
    name: 'Special Achievements',
    icon: 'trophy'
  }
];

// JWT Configuration
exports.JWT_CONFIG = {
  SECRET: process.env.JWT_SECRET || 'your-default-jwt-secret-key-here',
  EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d'
};

// Server Configuration
exports.SERVER_CONFIG = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/crypto-slots'
};