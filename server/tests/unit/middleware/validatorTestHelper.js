/**
 * Utility: run an array of express-validator middlewares against a mock req/res
 * and return the validation errors (array).
 */
const { validationResult } = require("express-validator");

async function runValidators(middlewares, body = {}) {
  const req = {
    body,
    headers: {},
    params: {},
    query: {},
  };
  const res = {};
  const next = () => {};

  for (const mw of middlewares) {
    await new Promise((resolve, reject) => {
      const result = mw(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
      if (result && typeof result.then === "function") {
        result.then(resolve).catch(reject);
      }
    });
  }

  return validationResult(req);
}

module.exports = { runValidators };
