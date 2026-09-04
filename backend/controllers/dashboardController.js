const Customer = require('../models/Customer');
const Account = require('../models/Account');
const Loan = require('../models/Loan');
const KYC = require('../models/KYC');
const SupportTicket = require('../models/SupportTicket');
const ActivityLog = require('../models/ActivityLog');

// @desc    Get dashboard summary stats
// @route   GET /api/dashboard/stats
// @access  Private
const getStats = async (req, res, next) => {
  try {
    const [
      customers,
      activeCustomers,
      accounts,
      loans,
      pendingLoans,
      approvedLoans,
      rejectedLoans,
      activeLoans,
      openTickets,
      resolvedTickets,
      pendingKyc,
      verifiedKyc,
    ] = await Promise.all([
      Customer.countDocuments(),
      Customer.countDocuments({ status: 'Active' }),
      Account.countDocuments(),
      Loan.countDocuments(),
      Loan.countDocuments({ status: 'Pending' }),
      Loan.countDocuments({ status: 'Approved' }),
      Loan.countDocuments({ status: 'Rejected' }),
      Loan.countDocuments({ status: 'Active' }),
      SupportTicket.countDocuments({ status: 'Open' }),
      SupportTicket.countDocuments({ status: 'Resolved' }),
      KYC.countDocuments({ verificationStatus: 'Pending' }),
      KYC.countDocuments({ verificationStatus: 'Verified' }),
    ]);

    res.status(200).json({
      success: true,
      data: {
        customers,
        activeCustomers,
        accounts,
        loans,
        pendingLoans,
        approvedLoans,
        rejectedLoans,
        activeLoans,
        openTickets,
        resolvedTickets,
        pendingKyc,
        verifiedKyc,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get chart data (loan status + ticket status breakdown)
// @route   GET /api/dashboard/charts
// @access  Private
const getChartData = async (req, res, next) => {
  try {
    const loanStatusAgg = await Loan.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const ticketStatusAgg = await SupportTicket.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const accountTypeAgg = await Account.aggregate([
      { $group: { _id: '$accountType', count: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      data: {
        loanStatus: loanStatusAgg.map((item) => ({ status: item._id, count: item.count })),
        ticketStatus: ticketStatusAgg.map((item) => ({ status: item._id, count: item.count })),
        accountType: accountTypeAgg.map((item) => ({ type: item._id, count: item.count })),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent activity logs
// @route   GET /api/dashboard/activity
// @access  Private
const getRecentActivity = async (req, res, next) => {
  try {
    const limit = Number(req.query.limit) || 10;

    const logs = await ActivityLog.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(limit);

    res.status(200).json({ success: true, data: logs });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStats, getChartData, getRecentActivity };
