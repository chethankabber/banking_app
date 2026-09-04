const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  createTicket,
  getTickets,
  getTicket,
  updateTicket,
  updateTicketStatus,
  assignTicket,
  deleteTicket,
} = require('../controllers/ticketController');
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');

const ticketValidation = [
  body('customer').notEmpty().withMessage('Customer is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('priority').optional().isIn(['Low', 'Medium', 'High']).withMessage('Invalid priority'),
];

router.use(protect);

router.route('/').post(ticketValidation, validate, createTicket).get(getTickets);

router.patch('/:id/status', updateTicketStatus);
router.patch('/:id/assign', assignTicket);

router
  .route('/:id')
  .get(getTicket)
  .put(ticketValidation, validate, updateTicket)
  .delete(authorize('admin'), deleteTicket);

module.exports = router;
