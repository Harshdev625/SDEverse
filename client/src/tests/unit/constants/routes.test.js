import { ROUTES, ROUTE_PATTERNS } from "../../../constants/routes";

describe("constants/routes", () => {
  it("exposes stable public routes", () => {
    expect(ROUTES.HOME).toBe("/");
    expect(ROUTES.LOGIN).toBe("/login");
    expect(ROUTES.DATA_STRUCTURES).toBe("/data-structures");
    expect(ROUTES.ADMIN.USERS).toBe("/admin/users");
  });

  it("builds dynamic routes correctly", () => {
    expect(ROUTES.ALGORITHM_DETAIL("two-sum")).toBe("/algorithms/two-sum");
    expect(ROUTES.BLOG_DETAIL("my-blog")).toBe("/blogs/my-blog");
    expect(ROUTES.PROFILE("harsh")).toBe("/profile/harsh");
  });

  it("defines expected route patterns", () => {
    expect(ROUTE_PATTERNS.ALGORITHM_DETAIL).toBe("/algorithms/:slug");
    expect(ROUTE_PATTERNS.PROFILE).toBe("/profile/:username");
  });

  it("covers additional dynamic and admin route entries", () => {
    expect(ROUTES.EDIT_ALGORITHM_PROPOSAL("s1")).toBe("/algorithms/proposals/s1/edit");
    expect(ROUTES.DATA_STRUCTURE_DETAIL("bst")).toBe("/data-structures/bst");
    expect(ROUTES.EDIT_DATA_STRUCTURE_PROPOSAL("heap")).toBe(
      "/data-structures/proposals/heap/edit"
    );
    expect(ROUTES.EDIT_BLOG("intro")).toBe("/blogs/intro/edit");
    expect(ROUTES.MORE_INFO("github")).toBe("/moreinfo/github");
    expect(ROUTES.ADMIN.ANALYTICS).toBe("/admin/analytics");
    expect(ROUTES.ADMIN.BROADCAST).toBe("/admin/broadcast");
  });
});
