const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const validateProblem = [
  body('title')
    .notEmpty().withMessage('Title is required')
    .trim()
    .isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  
  body('order')
    .notEmpty().withMessage('Order is required')
    .isInt({ min: 1 }).withMessage('Order must be a positive number'),
    
  body('difficulty')
    .notEmpty().withMessage('Difficulty is required')
    .isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard'),
    
  body('platform')
    .notEmpty().withMessage('Platform is required')
    .isIn(['leetcode', 'hackerrank', 'codeforces', 'codechef', 'atcoder', 'other'])
    .withMessage('Invalid platform'),

  body('platformLink')
    .notEmpty().withMessage('Platform link is required')
    .isURL().withMessage('Platform link must be a valid URL'),

  body('tags')
    .optional()
    .isArray().withMessage('Tags must be an array'),
  
  body('tags.*')
    .isString().withMessage('Each tag must be a string'),

  body('hints')
    .optional()
    .isArray().withMessage('Hints must be an array'),

  body('solution.content')
    .optional()
    .isObject().withMessage('Solution content must be an object'),

  handleValidationErrors,
];

module.exports = { validateProblem };