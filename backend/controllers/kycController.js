const KYC = require('../models/KYC');
const logActivity = require('../utils/logActivity');

// @desc    Create KYC record
// @route   POST /api/kyc
// @access  Private
const createKYC = async (req, res, next) => {
  try {
    const kyc = await KYC.create(req.body);

    await logActivity({
      user: req.user._id,
      action: 'KYC created',
      module: 'KYC',
      recordId: kyc._id,
      description: `KYC record (${kyc.documentType}) was created`,
    });

    res.status(201).json({ success: true, data: kyc });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all KYC records (filter, pagination)
// @route   GET /api/kyc
// @access  Private
const getKYCRecords = async (req, res, next) => {
  try {
    const { customer, verificationStatus, documentType, page = 1, limit = 10 } = req.query;

    const query = {};

    if (customer) query.customer = customer;
    if (verificationStatus) query.verificationStatus = verificationStatus;
    if (documentType) query.documentType = documentType;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const total = await KYC.countDocuments(query);
    const records = await KYC.find(query)
      .populate('customer', 'firstName lastName email customerId')
      .populate('verifiedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum);

    res.status(200).json({
      success: true,
      data: records,
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

// @desc    Get single KYC record
// @route   GET /api/kyc/:id
// @access  Private
const getKYC = async (req, res, next) => {
  try {
    const kyc = await KYC.findById(req.params.id)
      .populate('customer', 'firstName lastName email customerId phone')
      .populate('verifiedBy', 'name email');

    if (!kyc) {
      return res.status(404).json({ success: false, message: 'KYC record not found' });
    }

    res.status(200).json({ success: true, data: kyc });
  } catch (error) {
    next(error);
  }
};

// @desc    Update KYC record
// @route   PUT /api/kyc/:id
// @access  Private
const updateKYC = async (req, res, next) => {
  try {
    const kyc = await KYC.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!kyc) {
      return res.status(404).json({ success: false, message: 'KYC record not found' });
    }

    await logActivity({
      user: req.user._id,
      action: 'KYC updated',
      module: 'KYC',
      recordId: kyc._id,
      description: `KYC record (${kyc.documentType}) was updated`,
    });

    res.status(200).json({ success: true, data: kyc });
  } catch (error) {
    next(error);
  }
};

// @desc    Update KYC verification status
// @route   PATCH /api/kyc/:id/status
// @access  Private
const updateKYCStatus = async (req, res, next) => {
  try {
    const { verificationStatus, remarks } = req.body;

    const validStatuses = ['Pending', 'Verified', 'Rejected'];
    if (!validStatuses.includes(verificationStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid verification status' });
    }

    const kyc = await KYC.findById(req.params.id);

    if (!kyc) {
      return res.status(404).json({ success: false, message: 'KYC record not found' });
    }

    const oldStatus = kyc.verificationStatus;
    kyc.verificationStatus = verificationStatus;
    if (remarks !== undefined) kyc.remarks = remarks;
    kyc.verifiedBy = req.user._id;
    kyc.verifiedAt = new Date();

    await kyc.save();

    await logActivity({
      user: req.user._id,
      action: 'KYC status changed',
      module: 'KYC',
      recordId: kyc._id,
      description: `KYC status changed from ${oldStatus} to ${verificationStatus}`,
    });

    res.status(200).json({ success: true, data: kyc });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete KYC record
// @route   DELETE /api/kyc/:id
// @access  Private (admin only)
const deleteKYC = async (req, res, next) => {
  try {
    const kyc = await KYC.findById(req.params.id);

    if (!kyc) {
      return res.status(404).json({ success: false, message: 'KYC record not found' });
    }

    await kyc.deleteOne();

    await logActivity({
      user: req.user._id,
      action: 'KYC deleted',
      module: 'KYC',
      recordId: kyc._id,
      description: `KYC record (${kyc.documentType}) was deleted`,
    });

    res.status(200).json({ success: true, message: 'KYC record deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createKYC, getKYCRecords, getKYC, updateKYC, updateKYCStatus, deleteKYC };
