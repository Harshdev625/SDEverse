vi.mock("../../../models/user.model");
vi.mock("../../../models/otp.model");
vi.mock("../../../config/sendEmail", () => vi.fn());
vi.mock("../../../utils/generateToken", () => vi.fn(() => "mock-token"));

const User = require("../../../models/user.model");
const {
  registerUser,
  loginUser,
} = require("../../../controllers/auth.controller");

// ---- helpers ----
function makeRes() {
  const json = vi.fn();
  const res = { status: vi.fn(() => res), json };
  return res;
}

function makeReq(body = {}) {
  return { body };
}

/**
 * Call a controller the way Express does.
 * asyncHandler catches errors thrown inside and calls next(err).
 * We collect next calls to assert on error behavior indirectly via res.status.
 */
async function callController(controller, req, res) {
  const next = vi.fn();
  await controller(req, res, next);
  return { next };
}

// ---- registerUser ----
describe("auth.controller – registerUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "test-secret-for-unit-tests";
  });

  it("sets status 400 when required fields are missing", async () => {
    const res = makeRes();
    await callController(registerUser, makeReq({}), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("sets status 400 for invalid username format", async () => {
    const res = makeRes();
    await callController(registerUser, makeReq({ username: "a!", email: "a@b.com", password: "pass123" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("sets status 400 for invalid email format", async () => {
    const res = makeRes();
    await callController(registerUser, makeReq({ username: "alice", email: "not-an-email", password: "pass123" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("sets status 400 for weak password", async () => {
    const res = makeRes();
    await callController(registerUser, makeReq({ username: "alice", email: "alice@example.com", password: "abc" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("sets status 400 when email is already registered", async () => {
    User.findOne = vi.fn()
      .mockResolvedValueOnce({ _id: "existing" })
      .mockResolvedValueOnce(null);
    const res = makeRes();
    await callController(
      registerUser,
      makeReq({ username: "alice", email: "alice@example.com", password: "pass123" }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("sets status 400 when username is already taken", async () => {
    User.findOne = vi.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ _id: "x" });
    const res = makeRes();
    await callController(
      registerUser,
      makeReq({ username: "alice", email: "alice@example.com", password: "pass123" }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 201 with token on successful registration", async () => {
    User.findOne = vi.fn().mockResolvedValue(null);
    const fakeUser = {
      _id: "user-id-1",
      username: "alice",
      email: "alice@example.com",
      toObject: () => ({ _id: "user-id-1", username: "alice", email: "alice@example.com", password: "hashed" }),
    };
    User.create = vi.fn().mockResolvedValue(fakeUser);
    const res = makeRes();
    await callController(
      registerUser,
      makeReq({ username: "alice", email: "alice@example.com", password: "pass123" }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(201);
    const payload = res.json.mock.calls[0][0];
    expect(payload).toMatchObject({ username: "alice" });
    expect(typeof payload.token).toBe("string");
    expect(payload.password).toBeUndefined();
  });
});

// ---- loginUser ----
describe("auth.controller – loginUser", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sets status 400 when email or password missing", async () => {
    const res = makeRes();
    await callController(loginUser, makeReq({ email: "a@b.com" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("sets status 400 for invalid email", async () => {
    const res = makeRes();
    await callController(loginUser, makeReq({ email: "not-email", password: "pass123" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });
});
