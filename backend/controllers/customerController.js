const Customer = require('../models/Customer');
const Account = require('../models/Account');
const Loan = require('../models/Loan');
const KYC = require('../models/KYC');
const SupportTicket = require('../models/SupportTicket');
const logActivity = require('../utils/logActivity');

// @desc    Create customer
// @route   POST /api/customers
// @access  Private
const createCustomer = async (req, res, next) => {
  try {
    const count = await Customer.countDocuments();
    const customerId = `CUST${String(count + 1).padStart(4, '0')}`;

    const customer = await Customer.create({ ...req.body, customerId });

    await logActivity({
      user: req.user._id,
      action: 'Customer created',
      module: 'Customer',
      recordId: customer._id,
      description: `Customer ${customer.firstName} ${customer.lastName} was created`,
    });

    res.status(201).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all customers (search, filter, pagination)
// @route   GET /api/customers
// @access  Private
const getCustomers = async (req, res, next) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;

    const query = {};

    if (status) {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { customerId: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const total = await Customer.countDocuments(query);
    const customers = await Customer.find(query)
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: customers,
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

// @desc    Get single customer with related records
// @route   GET /api/customers/:id
// @access  Private
const getCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    const [accounts, loans, kyc, tickets] = await Promise.all([
      Account.find({ customer: customer._id }),
      Loan.find({ customer: customer._id }),
      KYC.find({ customer: customer._id }),
      SupportTicket.find({ customer: customer._id }),
    ]);

    res.status(200).json({
      success: true,
      data: { customer, accounts, loans, kyc, tickets },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private
const updateCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    await logActivity({
      user: req.user._id,
      action: 'Customer updated',
      module: 'Customer',
      recordId: customer._id,
      description: `Customer ${customer.firstName} ${customer.lastName} was updated`,
    });

    res.status(200).json({ success: true, data: customer });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private (admin only)
const deleteCustomer = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }

    // Prevent deleting a customer that still has active accounts or loans.
    const [accountCount, loanCount] = await Promise.all([
      Account.countDocuments({ customer: customer._id, status: { $ne: 'Closed' } }),
      Loan.countDocuments({ customer: customer._id, status: { $in: ['Pending', 'Approved', 'Active'] } }),
    ]);

    if (accountCount > 0 || loanCount > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cannot delete customer with active accounts or loans. Close them first.',
      });
    }

    await customer.deleteOne();

    await logActivity({
      user: req.user._id,
      action: 'Customer deleted',
      module: 'Customer',
      recordId: customer._id,
      description: `Customer ${customer.firstName} ${customer.lastName} was deleted`,
    });

    res.status(200).json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createCustomer, getCustomers, getCustomer, updateCustomer, deleteCustomer };
