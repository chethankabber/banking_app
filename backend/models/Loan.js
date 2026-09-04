const mongoose = require('mongoose');

const loanSchema = new mongoose.Schema(
  {
    loanNumber: {
      type: String,
      required: true,
      unique: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    loanType: {
      type: String,
      enum: ['Personal', 'Home', 'Vehicle', 'Education', 'Business'],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    interestRate: {
      type: Number,
      required: true,
      min: 0,
    },
    tenure: {
      type: Number,
      required: true,
      min: 1,
    },
    purpose: {
      type: String,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Active', 'Closed'],
      default: 'Pending',
    },
    appliedDate: {
      type: Date,
      default: Date.now,
    },
    approvedDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Loan', loanSchema);
