const { validationResult } = require('express-validator');
const User = require('../models/User');
const Machine = require('../models/Machine');
const Upgrade = require('../models/Upgrade');
const Transaction = require('../models/Transaction');
const { UPGRADE_CATEGORIES } = require('../config');

/**
 * @desc    Get available upgrades
 * @route   GET /api/upgrades
 * @access  Private
 */
exports.getAvailableUpgrades = async (req, res) => {
  try {
    const upgrades = await Upgrade.find({ isActive: true });
    res.json(upgrades);
  } catch (err) {
    console.error('Get available upgrades error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Get user's purchased upgrades
 * @route   GET /api/upgrades/user
 * @access  Private
 */
exports.getUserUpgrades = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('upgrades.upgradeId');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.upgrades);
  } catch (err) {
    console.error('Get user upgrades error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Purchase an upgrade
 * @route   POST /api/upgrades/purchase
 * @access  Private
 */
exports.purchaseUpgrade = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { upgradeId, machineId } = req.body;

  try {
    // Get user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get upgrade
    const upgrade = await Upgrade.findById(upgradeId);
    if (!upgrade) {
      return res.status(404).json({ message: 'Upgrade not found' });
    }

    // Check if user has enough coins
    if (user.gameBalance.coins < upgrade.price) {
      return res.status(400).json({ message: 'Insufficient coins' });
    }

    // Check if user meets requirements
    const machine = await Machine.findOne({ _id: machineId, owner: req.user.id });
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    if (machine.level < upgrade.requirements.machineLevel) {
      return res.status(400).json({ 
        message: `Machine level ${upgrade.requirements.machineLevel} required` 
      });
    }

    // Add upgrade to user
    user.upgrades.push({
      upgradeId: upgrade._id,
      purchaseDate: Date.now(),
      applied: false
    });

    // Deduct coins
    user.gameBalance.coins -= upgrade.price;

    // Create transaction
    const transaction = new Transaction({
      user: req.user.id,
      type: 'purchase_upgrade',
      amount: upgrade.price,
      currency: 'coins',
      description: `Purchased upgrade: ${upgrade.name}`,
      upgradeDetails: {
        upgradeId: upgrade._id,
        machineId
      },
      balanceAfter: {
        coins: user.gameBalance.coins,
        tokens: user.gameBalance.tokens
      }
    });

    await Promise.all([user.save(), transaction.save()]);

    res.json({
      upgrade,
      currentBalance: user.gameBalance
    });
  } catch (err) {
    console.error('Purchase upgrade error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Get specific upgrade details
 * @route   GET /api/upgrades/:id
 * @access  Private
 */
exports.getUpgradeDetails = async (req, res) => {
  try {
    const upgrade = await Upgrade.findById(req.params.id);
    if (!upgrade) {
      return res.status(404).json({ message: 'Upgrade not found' });
    }
    res.json(upgrade);
  } catch (err) {
    console.error('Get upgrade details error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Get upgrades for specific machine
 * @route   GET /api/upgrades/machine/:id
 * @access  Private
 */
exports.getMachineUpgrades = async (req, res) => {
  try {
    const machine = await Machine.findOne({
      _id: req.params.id,
      owner: req.user.id
    }).populate('upgrades.upgradeId');

    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    res.json(machine.upgrades);
  } catch (err) {
    console.error('Get machine upgrades error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Apply purchased upgrade to machine
 * @route   POST /api/upgrades/apply
 * @access  Private
 */
exports.applyUpgrade = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { upgradeId, machineId } = req.body;

  try {
    // Get user's upgrade
    const user = await User.findById(req.user.id);
    const userUpgrade = user.upgrades.find(
      u => u.upgradeId.toString() === upgradeId && !u.applied
    );

    if (!userUpgrade) {
      return res.status(400).json({ message: 'Upgrade not found or already applied' });
    }

    // Get machine
    const machine = await Machine.findOne({ _id: machineId, owner: req.user.id });
    if (!machine) {
      return res.status(404).json({ message: 'Machine not found' });
    }

    // Get upgrade details
    const upgrade = await Upgrade.findById(upgradeId);
    if (!upgrade) {
      return res.status(404).json({ message: 'Upgrade not found' });
    }

    // Apply upgrade effects to machine
    Object.keys(upgrade.effects).forEach(effect => {
      if (upgrade.effects[effect] !== 0) {
        machine.attributes[effect] += upgrade.effects[effect];
      }
    });

    // Add upgrade to machine
    machine.upgrades.push({
      upgradeId: upgrade._id,
      installedAt: Date.now(),
      active: true
    });

    // Mark upgrade as applied
    userUpgrade.applied = true;
    userUpgrade.appliedTo = machine._id;

    await Promise.all([machine.save(), user.save()]);

    res.json({
      machine,
      upgrade
    });
  } catch (err) {
    console.error('Apply upgrade error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Get upgrade categories
 * @route   GET /api/upgrades/categories
 * @access  Private
 */
exports.getUpgradeCategories = async (req, res) => {
  try {
    res.json(UPGRADE_CATEGORIES);
  } catch (err) {
    console.error('Get upgrade categories error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Get upgrades by category
 * @route   GET /api/upgrades/category/:id
 * @access  Private
 */
exports.getUpgradesByCategory = async (req, res) => {
  try {
    const upgrades = await Upgrade.find({
      category: req.params.id,
      isActive: true
    });
    res.json(upgrades);
  } catch (err) {
    console.error('Get upgrades by category error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Sell an upgrade
 * @route   POST /api/upgrades/sell
 * @access  Private
 */
exports.sellUpgrade = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { upgradeId } = req.body;

  try {
    // Get user's upgrade
    const user = await User.findById(req.user.id);
    const userUpgrade = user.upgrades.find(
      u => u.upgradeId.toString() === upgradeId && !u.applied
    );

    if (!userUpgrade) {
      return res.status(400).json({ message: 'Upgrade not found or already applied' });
    }

    // Get upgrade details
    const upgrade = await Upgrade.findById(upgradeId);
    if (!upgrade) {
      return res.status(404).json({ message: 'Upgrade not found' });
    }

    // Calculate sell value
    const sellValue = upgrade.sellValue || Math.floor(upgrade.price * 0.5);

    // Remove upgrade from user
    user.upgrades = user.upgrades.filter(
      u => u.upgradeId.toString() !== upgradeId
    );

    // Add coins to user
    user.gameBalance.coins += sellValue;

    // Create transaction
    const transaction = new Transaction({
      user: req.user.id,
      type: 'sell_upgrade',
      amount: sellValue,
      currency: 'coins',
      description: `Sold upgrade: ${upgrade.name}`,
      upgradeDetails: {
        upgradeId: upgrade._id
      },
      balanceAfter: {
        coins: user.gameBalance.coins,
        tokens: user.gameBalance.tokens
      }
    });

    await Promise.all([user.save(), transaction.save()]);

    res.json({
      sellValue,
      currentBalance: user.gameBalance
    });
  } catch (err) {
    console.error('Sell upgrade error:', err.message);
    res.status(500).send('Server error');
  }
};

/**
 * @desc    Get upgrade requirements
 * @route   GET /api/upgrades/requirements/:id
 * @access  Private
 */
exports.getUpgradeRequirements = async (req, res) => {
  try {
    const upgrade = await Upgrade.findById(req.params.id);
    if (!upgrade) {
      return res.status(404).json({ message: 'Upgrade not found' });
    }

    res.json(upgrade.requirements);
  } catch (err) {
    console.error('Get upgrade requirements error:', err.message);
    res.status(500).send('Server error');
  }
};