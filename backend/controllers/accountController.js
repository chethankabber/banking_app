const Account = require('../models/Account');
const logActivity = require('../utils/logActivity');

// @desc    Create account
// @route   POST /api/accounts
// @access  Private
const createAccount = async (req, res, next) => {
  try {
    const count = await Account.countDocuments();
    const accountNumber = `ACC${String(count + 1).padStart(6, '0')}`;

    const account = await Account.create({ ...req.body, accountNumber });

    await logActivity({
      user: req.user._id,
      action: 'Account created',
      module: 'Account',
      recordId: account._id,
      description: `Account ${account.accountNumber} was created`,
    });

    res.status(201).json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all accounts (search, filter, pagination)
// @route   GET /api/accounts
// @access  Private
const getAccounts = async (req, res, next) => {
  try {
    const { search, customer, accountType, status, page = 1, limit = 10 } = req.query;

    const query = {};

    if (customer) query.customer = customer;
    if (accountType) query.accountType = accountType;
    if (status) query.status = status;
    if (search) query.accountNumber = { $regex: search, $options: 'i' };

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const total = await Account.countDocuments(query);
    const accounts = await Account.find(query)
      .populate('customer', 'firstName lastName email customerId')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: accounts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single account
// @route   GET /api/accounts/:id
// @access  Private
const getAccount = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id).populate(
      'customer',
      'firstName lastName email customerId phone'
    );

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    res.status(200).json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
};

// @desc    Update account
// @route   PUT /api/accounts/:id
// @access  Private
const updateAccount = async (req, res, next) => {
  try {
    const account = await Account.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    await logActivity({
      user: req.user._id,
      action: 'Account updated',
      module: 'Account',
      recordId: account._id,
      description: `Account ${account.accountNumber} was updated`,
    });

    res.status(200).json({ success: true, data: account });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete account
// @route   DELETE /api/accounts/:id
// @access  Private (admin only)
const deleteAccount = async (req, res, next) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({ success: false, message: 'Account not found' });
    }

    await account.deleteOne();

    await logActivity({
      user: req.user._id,
      action: 'Account deleted',
      module: 'Account',
      recordId: account._id,
      description: `Account ${account.accountNumber} was deleted`,
    });

    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createAccount, getAccounts, getAccount, updateAccount, deleteAccount };
