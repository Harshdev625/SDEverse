const jwt = require("jsonwebtoken");

vi.mock("../../../models/user.model");
vi.mock("express-async-handler", () => (fn) => fn);

const User = require("../../../models/user.model");
const { protect, admin } = require("../../../middleware/auth.middleware");

function makeRes() {
  const res = { status: vi.fn() };
  res.status.mockReturnValue(res);
  return res;
}

describe("auth.middleware – protect", () => {
  let jwtVerifySpy;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env.JWT_SECRET = "test-secret";
    jwtVerifySpy = vi.spyOn(jwt, "verify");
  });

  afterEach(() => {
    jwtVerifySpy.mockRestore();
  });

  it("sets 401 when no Authorization header is provided", async () => {
    const req = { headers: {} };
    const res = makeRes();
    await protect(req, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("sets 401 when Authorization header is not Bearer scheme", async () => {
    const req = { headers: { authorization: "Basic abc123" } };
    const res = makeRes();
    await protect(req, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("sets 401 when JWT verification fails", async () => {
    jwtVerifySpy.mockImplementation(() => { throw new Error("invalid token"); });
    const req = { headers: { authorization: "Bearer badtoken" } };
    const res = makeRes();
    await protect(req, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("sets 401 when user is not found in DB", async () => {
    jwtVerifySpy.mockReturnValue({ id: "user123" });
    User.findById = vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue(null) });
    const req = { headers: { authorization: "Bearer validtoken" } };
    const res = makeRes();
    await protect(req, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("calls next() and sets req.user when token is valid", async () => {
    const fakeUser = { _id: "user123", username: "alice", role: "user" };
    jwtVerifySpy.mockReturnValue({ id: "user123" });
    User.findById = vi.fn().mockReturnValue({
      select: vi.fn().mockResolvedValue(fakeUser),
    });
    const req = { headers: { authorization: "Bearer validtoken" } };
    const res = makeRes();
    const next = vi.fn();
    await protect(req, res, next);
    expect(req.user).toBe(fakeUser);
    expect(next).toHaveBeenCalledOnce();
  });
});

describe("auth.middleware – admin", () => {
  const next = vi.fn();

  beforeEach(() => vi.clearAllMocks());

  it("throws 403 when req.user is missing", () => {
    const req = {};
    const res = makeRes();
    expect(() => admin(req, res, next)).toThrow("Not authorized as admin");
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("throws 403 when user role is not admin", () => {
    const req = { user: { role: "user" } };
    const res = makeRes();
    expect(() => admin(req, res, next)).toThrow("Not authorized as admin");
  });

  it("calls next() when user has admin role", () => {
    const req = { user: { role: "admin" } };
    const res = makeRes();
    admin(req, res, next);
    expect(next).toHaveBeenCalledOnce();
  });
});
