const { OTPModelMock, otpSaveMockRef, sendEmailMock } = vi.hoisted(() => ({
  OTPModelMock: vi.fn(),
  otpSaveMockRef: { current: null },
  sendEmailMock: vi.fn().mockResolvedValue(true),
}));

vi.mock("../../../models/user.model");
vi.mock("../../../models/otp.model", () => {
  OTPModelMock.mockImplementation(() => ({
    save: (...args) => otpSaveMockRef.current(...args),
  }));
  OTPModelMock.findOne = vi.fn();
  return OTPModelMock;
});
vi.mock("../../../config/sendEmail", () => sendEmailMock);
vi.mock("../../../utils/generateToken", () => vi.fn(() => "mock-token"));

const User = require("../../../models/user.model");
const OTP = require("../../../models/otp.model");
const {
  registerUser,
  loginUser,
  getMe,
  forgotPassword,
  validateOTP,
  resetPassword,
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
    otpSaveMockRef.current = vi.fn().mockResolvedValue({});
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

  it("sets status 400 when user creation fails", async () => {
    User.findOne = vi.fn().mockResolvedValue(null);
    User.create = vi.fn().mockResolvedValue(null);
    const res = makeRes();

    const { next } = await callController(
      registerUser,
      makeReq({ username: "alice", email: "alice@example.com", password: "pass123" }),
      res
    );

    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).toHaveBeenCalled();
  });
});

// ---- loginUser ----
describe("auth.controller – loginUser", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    otpSaveMockRef.current = vi.fn().mockResolvedValue({});
  });

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

  it("sets status 400 for invalid input types", async () => {
    const res = makeRes();
    await callController(loginUser, makeReq({ email: { bad: true }, password: 123 }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns token for valid credentials", async () => {
    const user = {
      _id: "u1",
      username: "alice",
      email: "alice@example.com",
      password: "hashed",
      matchPassword: vi.fn().mockResolvedValue(true),
      toObject: () => ({ _id: "u1", username: "alice", email: "alice@example.com", password: "hashed" }),
    };
    User.findOne = vi.fn().mockResolvedValue(user);
    const res = makeRes();

    await callController(loginUser, makeReq({ email: "alice@example.com", password: "pass123" }), res);

    const payload = res.json.mock.calls[0][0];
    expect(payload).toMatchObject({ _id: "u1", username: "alice", email: "alice@example.com" });
    expect(typeof payload.token).toBe("string");
  });

  it("sets status 401 for invalid credentials", async () => {
    User.findOne = vi.fn().mockResolvedValue({ matchPassword: vi.fn().mockResolvedValue(false) });
    const res = makeRes();
    await callController(loginUser, makeReq({ email: "alice@example.com", password: "wrong1" }), res);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe("auth.controller – getMe", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sets status 401 when req.user is missing", async () => {
    const res = makeRes();
    await callController(getMe, { user: null }, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns sanitized current user", async () => {
    const res = makeRes();
    const req = {
      user: {
        toObject: () => ({ _id: "u1", username: "alice", password: "hashed" }),
      },
    };
    await callController(getMe, req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ _id: "u1", username: "alice" });
  });
});

describe("auth.controller – forgotPassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    otpSaveMockRef.current = vi.fn().mockResolvedValue({});
  });

  it("sets status 400 when email is missing", async () => {
    const res = makeRes();
    await callController(forgotPassword, makeReq({}), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("sets status 400 for invalid email", async () => {
    const res = makeRes();
    await callController(forgotPassword, makeReq({ email: "bad" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns generic success when user is not found", async () => {
    User.findOne = vi.fn().mockResolvedValue(null);
    const res = makeRes();
    await callController(forgotPassword, makeReq({ email: "ghost@example.com" }), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(sendEmailMock).not.toHaveBeenCalled();
  });

});

describe("auth.controller – validateOTP", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sets status 400 for invalid or expired OTP", async () => {
    OTP.findOne = vi.fn().mockResolvedValue(null);
    const res = makeRes();
    await callController(validateOTP, makeReq({ email: "alice@example.com", code: "123456" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns success for a valid OTP", async () => {
    OTP.findOne = vi.fn().mockResolvedValue({
      email: "alice@example.com",
      code: 123456,
      createdAt: new Date(),
    });
    const res = makeRes();
    await callController(validateOTP, makeReq({ email: "alice@example.com", code: "123456" }), res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: true, message: "OTP validated successfully" })
    );
  });
});

describe("auth.controller – resetPassword", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sets status 400 when new password fields are missing", async () => {
    const res = makeRes();
    await callController(resetPassword, makeReq({ email: "alice@example.com", code: "123456" }), res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("sets status 400 when OTP is invalid", async () => {
    OTP.findOne = vi.fn().mockResolvedValue(null);
    const res = makeRes();
    await callController(
      resetPassword,
      makeReq({ email: "alice@example.com", code: "123456", newPassword: "pass123", confirmPassword: "pass123" }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("sets status 400 when passwords do not match", async () => {
    OTP.findOne = vi.fn().mockResolvedValue({ createdAt: new Date() });
    const res = makeRes();
    await callController(
      resetPassword,
      makeReq({ email: "alice@example.com", code: "123456", newPassword: "pass123", confirmPassword: "pass456" }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("sets status 400 for weak new password", async () => {
    OTP.findOne = vi.fn().mockResolvedValue({ createdAt: new Date() });
    const res = makeRes();
    await callController(
      resetPassword,
      makeReq({ email: "alice@example.com", code: "123456", newPassword: "abc", confirmPassword: "abc" }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("sets status 404 when user does not exist", async () => {
    OTP.findOne = vi.fn().mockResolvedValue({ createdAt: new Date() });
    User.findOne = vi.fn().mockResolvedValue(null);
    const res = makeRes();
    await callController(
      resetPassword,
      makeReq({ email: "alice@example.com", code: "123456", newPassword: "pass123", confirmPassword: "pass123" }),
      res
    );
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("resets password successfully", async () => {
    const save = vi.fn().mockResolvedValue(true);
    OTP.findOne = vi.fn().mockResolvedValue({ createdAt: new Date() });
    User.findOne = vi.fn().mockResolvedValue({ _id: "u1", save });
    const res = makeRes();
    await callController(
      resetPassword,
      makeReq({ email: "alice@example.com", code: "123456", newPassword: "pass123", confirmPassword: "pass123" }),
      res
    );
    expect(save).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });
});
