const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const upgradeController = require('../controllers/upgradeController');
const auth = require('../middleware/auth');

// @route   GET api/upgrades
// @desc    Get available upgrades
// @access  Private
router.get('/', auth, upgradeController.getAvailableUpgrades);

// @route   GET api/upgrades/user
// @desc    Get user's purchased upgrades
// @access  Private
router.get('/user', auth, upgradeController.getUserUpgrades);

// @route   POST api/upgrades/purchase
// @desc    Purchase an upgrade
// @access  Private
router.post(
  '/purchase',
  [
    auth,
    body('upgradeId', 'Upgrade ID is required').not().isEmpty(),
    body('machineId', 'Machine ID is required').not().isEmpty()
  ],
  upgradeController.purchaseUpgrade
);

// @route   GET api/upgrades/:id
// @desc    Get specific upgrade details
// @access  Private
router.get('/:id', auth, upgradeController.getUpgradeDetails);

// @route   GET api/upgrades/machine/:id
// @desc    Get upgrades for specific machine
// @access  Private
router.get('/machine/:id', auth, upgradeController.getMachineUpgrades);

// @route   POST api/upgrades/apply
// @desc    Apply purchased upgrade to machine
// @access  Private
router.post(
  '/apply',
  [
    auth,
    body('upgradeId', 'Upgrade ID is required').not().isEmpty(),
    body('machineId', 'Machine ID is required').not().isEmpty()
  ],
  upgradeController.applyUpgrade
);

// @route   GET api/upgrades/categories
// @desc    Get upgrade categories
// @access  Private
router.get('/categories', auth, upgradeController.getUpgradeCategories);

// @route   GET api/upgrades/category/:id
// @desc    Get upgrades by category
// @access  Private
router.get('/category/:id', auth, upgradeController.getUpgradesByCategory);

// @route   POST api/upgrades/sell
// @desc    Sell an upgrade
// @access  Private
router.post(
  '/sell',
  [
    auth,
    body('upgradeId', 'Upgrade ID is required').not().isEmpty()
  ],
  upgradeController.sellUpgrade
);

// @route   GET api/upgrades/requirements/:id
// @desc    Get upgrade requirements
// @access  Private
router.get('/requirements/:id', auth, upgradeController.getUpgradeRequirements);

module.exports = router;