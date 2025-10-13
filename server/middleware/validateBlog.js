const { body, param, query, validationResult } = require("express-validator");

const validate = (validations) => async (req, res, next) => {
  await Promise.all(validations.map((v) => v.run(req)));
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

const createBlogValidator = validate([
  body("title").isString().trim().isLength({ min: 5 }).withMessage("Title too short"),
  body("content").isString().isLength({ min: 20 }).withMessage("Content too short"),
  body("category").isIn(["StudyResources", "InterviewExperiences"]).withMessage("Invalid category"),
  body("studySubtype").optional().isIn(["DSA", "SystemDesign", "CSFundamentals", "Other"]).withMessage("Invalid study subtype"),
  body("company").optional().isString().trim(),
  body("role").optional().isString().trim(),
  body("tags").optional().isArray(),
]);

const updateBlogValidator = validate([
  body("title").optional().isString().trim().isLength({ min: 5 }),
  body("content").optional().isString().isLength({ min: 20 }),
  body("category").optional().isIn(["StudyResources", "InterviewExperiences"]),
  body("studySubtype").optional().isIn(["DSA", "SystemDesign", "CSFundamentals", "Other"]).withMessage("Invalid study subtype"),
  body("company").optional().isString().trim(),
  body("role").optional().isString().trim(),
  body("tags").optional().isArray(),
  body("status").optional().isIn(["pending", "approved", "rejected"]),
]);

module.exports = { createBlogValidator, updateBlogValidator };
