const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createKYC,
  getKYCRecords,
  getKYC,
  updateKYC,
  updateKYCStatus,
  deleteKYC,
} = require('../controllers/kycController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');

const kycValidation = [
  body('customer').notEmpty().withMessage('Customer is required'),
  body('documentType')
    .isIn(['Aadhaar', 'PAN', 'Passport', 'Driving License', 'Voter ID'])
    .withMessage('Invalid document type'),
  body('documentNumber').notEmpty().withMessage('Document number is required'),
];

router.use(protect);

router.route('/').post(kycValidation, validate, createKYC).get(getKYCRecords);

router.patch('/:id/status', updateKYCStatus);

router
  .route('/:id')
  .get(getKYC)
  .put(kycValidation, validate, updateKYC)
  .delete(authorize('admin'), deleteKYC);

module.exports = router;
