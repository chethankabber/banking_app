const { validationResult } = require('express-validator');

// Runs after express-validator's checks and turns any failures into a
// consistent 400 response instead of letting the request continue.
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((err) => ({ field: err.path, message: err.msg })),
    });
  }

  next();
};

module.exports = validate;
