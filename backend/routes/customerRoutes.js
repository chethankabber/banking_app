const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
} = require('../controllers/customerController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');

const customerValidation = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('email').isEmail().withMessage('A valid email is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
  body('pincode').optional().isPostalCode('any').withMessage('Invalid pincode'),
];

router.use(protect);

router.route('/').post(customerValidation, validate, createCustomer).get(getCustomers);

router
  .route('/:id')
  .get(getCustomer)
  .put(customerValidation, validate, updateCustomer)
  .delete(authorize('admin'), deleteCustomer);

module.exports = router;
