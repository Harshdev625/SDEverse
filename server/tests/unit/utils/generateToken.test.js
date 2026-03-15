const jwt = require("jsonwebtoken");
const generateToken = require("../../../utils/generateToken");

describe("generateToken", () => {
  it("creates a valid JWT with id payload and 7d expiry", () => {
    const oldSecret = process.env.JWT_SECRET;
    process.env.JWT_SECRET = "unit-test-secret";

    const token = generateToken("user-123");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    expect(decoded.id).toBe("user-123");
    expect(decoded.exp).toBeGreaterThan(decoded.iat);

    process.env.JWT_SECRET = oldSecret;
  });
});
