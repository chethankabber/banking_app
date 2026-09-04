const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createAccount,
  getAccounts,
  getAccount,
  updateAccount,
  deleteAccount,
} = require('../controllers/accountController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');

const accountValidation = [
  body('customer').notEmpty().withMessage('Customer is required'),
  body('accountType').isIn(['Savings', 'Current']).withMessage('Invalid account type'),
  body('balance').optional().isFloat({ min: 0 }).withMessage('Balance cannot be negative'),
  body('branch').notEmpty().withMessage('Branch is required'),
];

router.use(protect);

router.route('/').post(accountValidation, validate, createAccount).get(getAccounts);

router
  .route('/:id')
  .get(getAccount)
  .put(accountValidation, validate, updateAccount)
  .delete(authorize('admin'), deleteAccount);

module.exports = router;
