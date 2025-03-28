const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const cryptoController = require('../controllers/cryptoController');
const auth = require('../middleware/auth');

// @route   GET api/crypto/balance
// @desc    Get user's crypto balance
// @access  Private
router.get('/balance', auth, cryptoController.getCryptoBalance);

// @route   GET api/crypto/prices
// @desc    Get current cryptocurrency prices
// @access  Private
router.get('/prices', auth, cryptoController.getCryptoPrices);

// @route   POST api/crypto/purchase
// @desc    Purchase cryptocurrency with in-game currency
// @access  Private
router.post(
  '/purchase',
  [
    auth,
    body('cryptoType', 'Cryptocurrency type is required').not().isEmpty(),
    body('amount', 'Amount is required').isNumeric()
  ],
  cryptoController.purchaseCrypto
);

// @route   POST api/crypto/sell
// @desc    Sell cryptocurrency for in-game currency
// @access  Private
router.post(
  '/sell',
  [
    auth,
    body('cryptoType', 'Cryptocurrency type is required').not().isEmpty(),
    body('amount', 'Amount is required').isNumeric()
  ],
  cryptoController.sellCrypto
);

// @route   POST api/crypto/withdraw
// @desc    Withdraw cryptocurrency to external wallet
// @access  Private
router.post(
  '/withdraw',
  [
    auth,
    body('cryptoType', 'Cryptocurrency type is required').not().isEmpty(),
    body('amount', 'Amount is required').isNumeric(),
    body('walletAddress', 'Wallet address is required').not().isEmpty()
  ],
  cryptoController.withdrawCrypto
);

// @route   POST api/crypto/deposit
// @desc    Deposit cryptocurrency from external wallet
// @access  Private
router.post(
  '/deposit',
  [
    auth,
    body('cryptoType', 'Cryptocurrency type is required').not().isEmpty(),
    body('amount', 'Amount is required').isNumeric()
  ],
  cryptoController.depositCrypto
);

// @route   GET api/crypto/transactions
// @desc    Get user's crypto transactions
// @access  Private
router.get('/transactions', auth, cryptoController.getCryptoTransactions);

// @route   GET api/crypto/portfolio
// @desc    Get user's crypto portfolio
// @access  Private
router.get('/portfolio', auth, cryptoController.getCryptoPortfolio);

// @route   GET api/crypto/supported
// @desc    Get list of supported cryptocurrencies
// @access  Private
router.get('/supported', auth, cryptoController.getSupportedCryptos);

// @route   POST api/crypto/convert
// @desc    Convert between different cryptocurrencies
// @access  Private
router.post(
  '/convert',
  [
    auth,
    body('fromCrypto', 'Source cryptocurrency is required').not().isEmpty(),
    body('toCrypto', 'Target cryptocurrency is required').not().isEmpty(),
    body('amount', 'Amount is required').isNumeric()
  ],
  cryptoController.convertCrypto
);

module.exports = router;