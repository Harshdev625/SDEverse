// Proposal schema
const Joi = require("joi");

const proposalSchema = Joi.object({
  sheetId: Joi.string().required(),
  proposedChanges: Joi.string().required(),
  status: Joi.string().required(),
});

module.exports = proposalSchema;
