const Loan = require('../models/Loan');
const logActivity = require('../utils/logActivity');

// @desc    Create loan
// @route   POST /api/loans
// @access  Private
const createLoan = async (req, res, next) => {
  try {
    const count = await Loan.countDocuments();
    const loanNumber = `LN${String(count + 1001)}`;

    const loan = await Loan.create({ ...req.body, loanNumber });

    await logActivity({
      user: req.user._id,
      action: 'Loan created',
      module: 'Loan',
      recordId: loan._id,
      description: `Loan ${loan.loanNumber} was created`,
    });

    res.status(201).json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all loans (search, filter, pagination)
// @route   GET /api/loans
// @access  Private
const getLoans = async (req, res, next) => {
  try {
    const { search, customer, loanType, status, page = 1, limit = 10 } = req.query;

    const query = {};

    if (customer) query.customer = customer;
    if (loanType) query.loanType = loanType;
    if (status) query.status = status;
    if (search) query.loanNumber = { $regex: search, $options: 'i' };

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const total = await Loan.countDocuments(query);
    const loans = await Loan.find(query)
      .populate('customer', 'firstName lastName email customerId')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: loans,
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

// @desc    Get single loan
// @route   GET /api/loans/:id
// @access  Private
const getLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id).populate(
      'customer',
      'firstName lastName email customerId phone'
    );

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    res.status(200).json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

// @desc    Update loan
// @route   PUT /api/loans/:id
// @access  Private
const updateLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    await logActivity({
      user: req.user._id,
      action: 'Loan updated',
      module: 'Loan',
      recordId: loan._id,
      description: `Loan ${loan.loanNumber} was updated`,
    });

    res.status(200).json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

// @desc    Update loan status
// @route   PATCH /api/loans/:id/status
// @access  Private
const updateLoanStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const validStatuses = ['Pending', 'Approved', 'Rejected', 'Active', 'Closed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid loan status' });
    }

    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    const oldStatus = loan.status;
    loan.status = status;

    if (status === 'Approved' && !loan.approvedDate) {
      loan.approvedDate = new Date();
    }

    await loan.save();

    await logActivity({
      user: req.user._id,
      action: 'Loan status changed',
      module: 'Loan',
      recordId: loan._id,
      description: `Loan ${loan.loanNumber} status changed from ${oldStatus} to ${status}`,
    });

    res.status(200).json({ success: true, data: loan });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete loan
// @route   DELETE /api/loans/:id
// @access  Private (admin only)
const deleteLoan = async (req, res, next) => {
  try {
    const loan = await Loan.findById(req.params.id);

    if (!loan) {
      return res.status(404).json({ success: false, message: 'Loan not found' });
    }

    await loan.deleteOne();

    await logActivity({
      user: req.user._id,
      action: 'Loan deleted',
      module: 'Loan',
      recordId: loan._id,
      description: `Loan ${loan.loanNumber} was deleted`,
    });

    res.status(200).json({ success: true, message: 'Loan deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createLoan, getLoans, getLoan, updateLoan, updateLoanStatus, deleteLoan };
