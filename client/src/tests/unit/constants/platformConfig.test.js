import {
  PLATFORM_CONFIG,
  getPlatformConfig,
  getCompetitivePlatforms,
  getSocialPlatforms,
  getPlatformsWithDetails,
} from "../../../constants/platformConfig";

describe("constants/platformConfig", () => {
  it("returns platform config case-insensitively and default fallback", () => {
    expect(getPlatformConfig("GitHub").name).toBe("GitHub");
    expect(getPlatformConfig("unknown-platform")).toBe(PLATFORM_CONFIG.default);
    expect(getPlatformConfig(undefined)).toBe(PLATFORM_CONFIG.default);
  });

  it("returns competitive platforms only", () => {
    const items = getCompetitivePlatforms();
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((p) => p.category === "competitive")).toBe(true);
  });

  it("returns social platforms only", () => {
    const items = getSocialPlatforms();
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((p) => p.category === "social")).toBe(true);
  });

  it("returns platforms that have details", () => {
    const items = getPlatformsWithDetails();
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((p) => p.hasDetails)).toBe(true);
  });
});
