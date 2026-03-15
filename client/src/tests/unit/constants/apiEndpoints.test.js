import { API_BASE_URL, API_ENDPOINTS } from "../../../constants/apiEndpoints";

describe("constants/apiEndpoints", () => {
  it("has a base URL string", () => {
    expect(typeof API_BASE_URL).toBe("string");
    expect(API_BASE_URL.length).toBeGreaterThan(0);
  });

  it("contains stable static endpoints", () => {
    expect(API_ENDPOINTS.AUTH.LOGIN).toBe("/auth/login");
    expect(API_ENDPOINTS.NOTIFICATIONS.BROADCAST).toBe("/notifications/broadcast");
    expect(API_ENDPOINTS.CONTACT.ALL).toBe("/contact/all");
  });

  it("builds parameterized endpoints", () => {
    expect(API_ENDPOINTS.ALGORITHMS.BY_SLUG("two-sum")).toBe("/algorithms/two-sum");
    expect(API_ENDPOINTS.COMMENTS.BY_PARENT("blog", "id1")).toBe("/comments/blog/id1");
    expect(API_ENDPOINTS.LINK_GROUPS.UPDATE_LINK("g1", "l1")).toBe("/link-groups/g1/links/l1");
  });

  it("covers endpoint groups and dynamic builders", () => {
    expect(API_ENDPOINTS.AUTH.REGISTER).toBe("/auth/register");
    expect(API_ENDPOINTS.ALGORITHMS.BY_ID("a1")).toBe("/algorithms/a1");
    expect(API_ENDPOINTS.DATA_STRUCTURES.BY_ID("d1")).toBe("/datastructures/d1");
    expect(API_ENDPOINTS.PROPOSALS.REVIEW("p1")).toBe("/proposals/p1/review");
    expect(API_ENDPOINTS.DATA_STRUCTURE_PROPOSALS.REVIEW("dp1")).toBe(
      "/datastructure-proposals/dp1/review"
    );
    expect(API_ENDPOINTS.BLOGS.REVIEW("b1")).toBe("/blogs/b1/review");
    expect(API_ENDPOINTS.BOOKMARKS.DELETE("algo", "1")).toBe("/bookmarks/algo/1");
    expect(API_ENDPOINTS.NOTES.DELETE("algo", "1")).toBe("/notes/algo/1");
    expect(API_ENDPOINTS.LINK_GROUPS.SHARE("g1")).toBe("/link-groups/g1/share");
    expect(API_ENDPOINTS.USERS.UPDATE_ROLE("u1")).toBe("/users/u1/role");
    expect(API_ENDPOINTS.NOTIFICATIONS.MARK_READ("n1")).toBe("/notifications/n1/read");
    expect(API_ENDPOINTS.FEEDBACK.UPDATE_STATUS("f1")).toBe("/feedback/f1/status");
    expect(API_ENDPOINTS.CONTACT.DELETE("c1")).toBe("/contact/c1");
    expect(API_ENDPOINTS.COMMUNITY.STATS).toBe("/community/stats");
    expect(API_ENDPOINTS.ANALYTICS.OVERVIEW).toBe("/analytics/overview");
  });

  it("covers the full endpoint map", () => {
    expect(API_ENDPOINTS.AUTH.LOGOUT).toBe("/auth/logout");
    expect(API_ENDPOINTS.AUTH.ME).toBe("/auth/me");
    expect(API_ENDPOINTS.AUTH.PROFILE).toBe("/auth/profile");
    expect(API_ENDPOINTS.AUTH.UPDATE_PROFILE).toBe("/auth/profile");
    expect(API_ENDPOINTS.AUTH.FORGOT_PASSWORD).toBe("/auth/forgot-password");
    expect(API_ENDPOINTS.AUTH.RESET_PASSWORD).toBe("/auth/reset-password");
    expect(API_ENDPOINTS.AUTH.VERIFY_OTP).toBe("/auth/verify-otp");
    expect(API_ENDPOINTS.AUTH.RESEND_OTP).toBe("/auth/resend-otp");
    expect(API_ENDPOINTS.AUTH.REFRESH_STATS).toBe("/auth/refresh-stats");

    expect(API_ENDPOINTS.ALGORITHMS.BASE).toBe("/algorithms");
    expect(API_ENDPOINTS.ALGORITHMS.BY_ID("id1")).toBe("/algorithms/id1");
    expect(API_ENDPOINTS.ALGORITHMS.CREATE).toBe("/algorithms");
    expect(API_ENDPOINTS.ALGORITHMS.UPDATE("id1")).toBe("/algorithms/id1");
    expect(API_ENDPOINTS.ALGORITHMS.DELETE("id1")).toBe("/algorithms/id1");

    expect(API_ENDPOINTS.DATA_STRUCTURES.BASE).toBe("/datastructures");
    expect(API_ENDPOINTS.DATA_STRUCTURES.BY_SLUG("heap")).toBe("/datastructures/heap");
    expect(API_ENDPOINTS.DATA_STRUCTURES.CREATE).toBe("/datastructures");
    expect(API_ENDPOINTS.DATA_STRUCTURES.UPDATE("id2")).toBe("/datastructures/id2");
    expect(API_ENDPOINTS.DATA_STRUCTURES.DELETE("id2")).toBe("/datastructures/id2");

    expect(API_ENDPOINTS.PROPOSALS.BASE).toBe("/proposals");
    expect(API_ENDPOINTS.PROPOSALS.BY_ID("p1")).toBe("/proposals/p1");
    expect(API_ENDPOINTS.PROPOSALS.BY_SLUG("slug-1")).toBe("/proposals/slug-1");
    expect(API_ENDPOINTS.PROPOSALS.CREATE).toBe("/proposals");
    expect(API_ENDPOINTS.PROPOSALS.UPDATE("p1")).toBe("/proposals/p1");
    expect(API_ENDPOINTS.PROPOSALS.DELETE("p1")).toBe("/proposals/p1");
    expect(API_ENDPOINTS.PROPOSALS.MY_PROPOSALS).toBe("/proposals/my");

    expect(API_ENDPOINTS.DATA_STRUCTURE_PROPOSALS.BASE).toBe("/datastructure-proposals");
    expect(API_ENDPOINTS.DATA_STRUCTURE_PROPOSALS.BY_ID("dp1")).toBe(
      "/datastructure-proposals/dp1"
    );
    expect(API_ENDPOINTS.DATA_STRUCTURE_PROPOSALS.BY_SLUG("slug-dp")).toBe(
      "/datastructure-proposals/slug-dp"
    );
    expect(API_ENDPOINTS.DATA_STRUCTURE_PROPOSALS.CREATE).toBe("/datastructure-proposals");
    expect(API_ENDPOINTS.DATA_STRUCTURE_PROPOSALS.UPDATE("dp1")).toBe(
      "/datastructure-proposals/dp1"
    );
    expect(API_ENDPOINTS.DATA_STRUCTURE_PROPOSALS.DELETE("dp1")).toBe(
      "/datastructure-proposals/dp1"
    );

    expect(API_ENDPOINTS.BLOGS.BASE).toBe("/blogs");
    expect(API_ENDPOINTS.BLOGS.BY_ID("b1")).toBe("/blogs/b1");
    expect(API_ENDPOINTS.BLOGS.BY_SLUG("blog-1")).toBe("/blogs/blog-1");
    expect(API_ENDPOINTS.BLOGS.CREATE).toBe("/blogs");
    expect(API_ENDPOINTS.BLOGS.UPDATE("b1")).toBe("/blogs/b1");
    expect(API_ENDPOINTS.BLOGS.DELETE("b1")).toBe("/blogs/b1");
    expect(API_ENDPOINTS.BLOGS.MY_BLOGS).toBe("/blogs/my");

    expect(API_ENDPOINTS.COMMENTS.BASE).toBe("/comments");
    expect(API_ENDPOINTS.COMMENTS.CREATE).toBe("/comments");
    expect(API_ENDPOINTS.COMMENTS.UPDATE("c1")).toBe("/comments/c1");
    expect(API_ENDPOINTS.COMMENTS.DELETE("c1")).toBe("/comments/c1");

    expect(API_ENDPOINTS.BOOKMARKS.BASE).toBe("/bookmarks");
    expect(API_ENDPOINTS.BOOKMARKS.BY_PARENT("blog", "b1")).toBe("/bookmarks/blog/b1");
    expect(API_ENDPOINTS.BOOKMARKS.CREATE).toBe("/bookmarks");
    expect(API_ENDPOINTS.BOOKMARKS.MY_BOOKMARKS).toBe("/bookmarks/my");

    expect(API_ENDPOINTS.NOTES.BASE).toBe("/notes");
    expect(API_ENDPOINTS.NOTES.BY_PARENT("blog", "b1")).toBe("/notes/blog/b1");
    expect(API_ENDPOINTS.NOTES.CREATE).toBe("/notes");
    expect(API_ENDPOINTS.NOTES.UPDATE("blog", "b1")).toBe("/notes/blog/b1");
    expect(API_ENDPOINTS.NOTES.MY_NOTES).toBe("/notes/my");

    expect(API_ENDPOINTS.LINK_GROUPS.BASE).toBe("/link-groups");
    expect(API_ENDPOINTS.LINK_GROUPS.BY_ID("g1")).toBe("/link-groups/g1");
    expect(API_ENDPOINTS.LINK_GROUPS.CREATE).toBe("/link-groups");
    expect(API_ENDPOINTS.LINK_GROUPS.UPDATE("g1")).toBe("/link-groups/g1");
    expect(API_ENDPOINTS.LINK_GROUPS.DELETE("g1")).toBe("/link-groups/g1");
    expect(API_ENDPOINTS.LINK_GROUPS.MY_GROUPS).toBe("/link-groups/my");
    expect(API_ENDPOINTS.LINK_GROUPS.ADD_LINK("g1")).toBe("/link-groups/g1/links");
    expect(API_ENDPOINTS.LINK_GROUPS.DELETE_LINK("g1", "l1")).toBe(
      "/link-groups/g1/links/l1"
    );

    expect(API_ENDPOINTS.USERS.BASE).toBe("/users");
    expect(API_ENDPOINTS.USERS.BY_ID("u1")).toBe("/users/u1");
    expect(API_ENDPOINTS.USERS.BY_USERNAME("alice")).toBe("/users/alice");
    expect(API_ENDPOINTS.USERS.DELETE("u1")).toBe("/users/u1");

    expect(API_ENDPOINTS.NOTIFICATIONS.BASE).toBe("/notifications");
    expect(API_ENDPOINTS.NOTIFICATIONS.MY_NOTIFICATIONS).toBe("/notifications/my");
    expect(API_ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ).toBe("/notifications/read-all");
    expect(API_ENDPOINTS.NOTIFICATIONS.DELETE("n1")).toBe("/notifications/n1");

    expect(API_ENDPOINTS.FEEDBACK.BASE).toBe("/feedback");
    expect(API_ENDPOINTS.FEEDBACK.BY_ID("f1")).toBe("/feedback/f1");
    expect(API_ENDPOINTS.FEEDBACK.CREATE).toBe("/feedback");
    expect(API_ENDPOINTS.FEEDBACK.DELETE("f1")).toBe("/feedback/f1");

    expect(API_ENDPOINTS.CONTACT.BASE).toBe("/contact");
    expect(API_ENDPOINTS.CONTACT.CREATE).toBe("/contact");
    expect(API_ENDPOINTS.CONTACT.BY_ID("c1")).toBe("/contact/c1");

    expect(API_ENDPOINTS.COMMUNITY.GUIDELINES).toBe("/community/guidelines");

    expect(API_ENDPOINTS.ANALYTICS.USERS).toBe("/analytics/users");
    expect(API_ENDPOINTS.ANALYTICS.CONTENT).toBe("/analytics/content");
  });
});
