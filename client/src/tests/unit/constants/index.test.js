import * as constants from "../../../constants";

describe("constants/index", () => {
  it("re-exports route, platform, and api endpoint modules", () => {
    expect(constants.ROUTES.HOME).toBe("/");
    expect(typeof constants.getPlatformConfig).toBe("function");
    expect(constants.API_ENDPOINTS.AUTH.LOGIN).toBe("/auth/login");
  });
});
