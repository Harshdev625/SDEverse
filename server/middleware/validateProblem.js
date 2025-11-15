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
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 3 }).withMessage('Title must be at least 3 characters'),
  
  body('order')
    .optional({ checkFalsy: true })
    .notEmpty().withMessage('Order is required')
    .isInt({ min: 1 }).withMessage('Order must be a positive number'),
    
  body('difficulty')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty().withMessage('Difficulty is required')
    .isIn(['easy', 'medium', 'hard']).withMessage('Difficulty must be easy, medium, or hard')
    .toLowerCase(),
    
  body('platform')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty().withMessage('Platform is required')
    .isIn(['leetcode', 'hackerrank', 'codeforces', 'codechef', 'atcoder', 'other'])
    .withMessage('Invalid platform')
    .toLowerCase(),

  body('platformLink')
    .optional({ checkFalsy: true })
    .trim()
    .notEmpty().withMessage('Platform link is required')
    .matches(/^https?:\/\/.+/).withMessage('Platform link must be a valid URL starting with http:// or https://'),

  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),

  body('tags')
    .optional({ checkFalsy: true })
    .isArray().withMessage('Tags must be an array'),
  
  body('tags.*')
    .optional({ checkFalsy: true })
    .trim()
    .isString().withMessage('Each tag must be a string'),

  body('hints')
    .optional({ checkFalsy: true })
    .isArray().withMessage('Hints must be an array'),

  body('hints.*.content')
    .optional({ checkFalsy: true })
    .isString().withMessage('Each hint content must be a string'),

  body('solution')
    .optional({ checkFalsy: true })
    .isObject().withMessage('Solution must be an object'),

  body('solution.content')
    .optional({ checkFalsy: true })
    .isObject().withMessage('Solution content must be an object'),

  body('solution.content.python')
    .optional({ checkFalsy: true })
    .isString().withMessage('Python solution must be a string'),

  body('solution.content.javascript')
    .optional({ checkFalsy: true })
    .isString().withMessage('JavaScript solution must be a string'),

  body('solution.content.java')
    .optional({ checkFalsy: true })
    .isString().withMessage('Java solution must be a string'),

  body('solution.content.cpp')
    .optional({ checkFalsy: true })
    .isString().withMessage('C++ solution must be a string'),

  body('solution.content.csharp')
    .optional({ checkFalsy: true })
    .isString().withMessage('C# solution must be a string'),

  body('solution.explanation')
    .optional({ checkFalsy: true })
    .isString().withMessage('Solution explanation must be a string'),

  handleValidationErrors,
];

module.exports = { validateProblem };