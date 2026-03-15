vi.mock("../../../../utils/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from "../../../../utils/api";
import {
  registerUserAPI,
  loginUserAPI,
  getMeAPI,
  forgotPasswordAPI,
  validateOTPAPI,
  resetPasswordAPI,
} from "../../../../features/auth/authAPI";

describe("features/auth/authAPI", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls auth endpoints with expected payloads", async () => {
    api.post.mockResolvedValue({ data: { ok: true } });
    api.get.mockResolvedValue({ data: { user: { _id: "u1" } } });

    await registerUserAPI({ username: "u" });
    expect(api.post).toHaveBeenCalledWith("/auth/register", { username: "u" });

    await loginUserAPI({ email: "a@b.com", password: "x" });
    expect(api.post).toHaveBeenCalledWith("/auth/login", { email: "a@b.com", password: "x" });

    await forgotPasswordAPI({ email: "a@b.com" });
    expect(api.post).toHaveBeenCalledWith("/auth/forgot-password", { email: "a@b.com" });

    await validateOTPAPI({ email: "a@b.com", otp: "1234" });
    expect(api.post).toHaveBeenCalledWith("/auth/validate-otp", { email: "a@b.com", otp: "1234" });

    await resetPasswordAPI({ email: "a@b.com", password: "new" });
    expect(api.post).toHaveBeenCalledWith("/auth/reset-password", { email: "a@b.com", password: "new" });

    await getMeAPI("token123");
    expect(api.get).toHaveBeenCalledWith("/auth/me", {
      headers: { Authorization: "Bearer token123" },
    });
  });
});
