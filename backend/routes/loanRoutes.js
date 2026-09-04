const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createLoan,
  getLoans,
  getLoan,
  updateLoan,
  updateLoanStatus,
  deleteLoan,
} = require('../controllers/loanController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');

const loanValidation = [
  body('customer').notEmpty().withMessage('Customer is required'),
  body('loanType')
    .isIn(['Personal', 'Home', 'Vehicle', 'Education', 'Business'])
    .withMessage('Invalid loan type'),
  body('amount').isFloat({ gt: 0 }).withMessage('Amount must be greater than 0'),
  body('interestRate').isFloat({ min: 0 }).withMessage('Interest rate must be valid'),
  body('tenure').isInt({ gt: 0 }).withMessage('Tenure must be valid'),
];

router.use(protect);

router.route('/').post(loanValidation, validate, createLoan).get(getLoans);

router.patch('/:id/status', updateLoanStatus);

router
  .route('/:id')
  .get(getLoan)
  .put(loanValidation, validate, updateLoan)
  .delete(authorize('admin'), deleteLoan);

module.exports = router;
