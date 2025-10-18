// Middleware to validate request body
const Joi = require("joi");

const validateBody = (schema) => (req, res, next) => {
  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details.map((d) => d.message) });
  }
  next();
};

module.exports = validateBody;
