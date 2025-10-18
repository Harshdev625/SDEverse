const Joi = require("joi");

// Sheet schema
const sheetSchema = Joi.object({
  title: Joi.string().min(3).required(),
  description: Joi.string().min(5).required(),
  difficulty: Joi.string().valid("Easy", "Medium", "Hard").required(),
  platform: Joi.string().required(),
  questions: Joi.array()
    .items(
      Joi.object({
        title: Joi.string().required(),
        difficulty: Joi.string().valid("Easy", "Medium", "Hard").required(),
        platformLink: Joi.string().uri().optional(),
      })
    )
    .optional(),
});

module.exports = sheetSchema;
