const { body, validationResult } = require('express-validator');

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Validation rules for creating/updating a problem sheet
const validateProblemSheet = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isString().withMessage('Name must be a string')
    .isLength({ min: 3, max: 100 }).withMessage('Name must be between 3 and 100 characters'),
  
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isString().withMessage('Description must be a string')
    .isLength({ min: 10, max: 500 }).withMessage('Description must be between 10 and 500 characters'),

  body('icon')
    .optional({ checkFalsy: true })
    .trim()
    .isString().withMessage('Icon must be a string')
    .isLength({ max: 5 }).withMessage('Icon can be at most 5 characters'),

  body('isActive')
    .optional({ checkFalsy: false }) 
    .isBoolean().withMessage('isActive must be a boolean'),

  handleValidationErrors,
];

module.exports = { validateProblemSheet };