vi.mock("../../../../utils/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from "../../../../utils/api";
import {
  searchUsers,
  fetchAllUsers,
  fetchUserById,
  fetchUserByUsername,
  deleteUserById,
  updateUserRole,
  fetchAdminAnalytics,
  fetchMyProfile,
  updateMyProfile,
  updateSocialProfiles,
  updateCompetitiveStats,
  updateSingleSocialStat,
  updateSingleCompetitiveStat,
} from "../../../../features/user/userAPI";

describe("features/user/userAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { ok: true } });
    api.put.mockResolvedValue({ data: { ok: true } });
    api.patch.mockResolvedValue({ data: { user: { _id: "u1" } } });
    api.delete.mockResolvedValue({ data: { ok: true } });
  });

  it("calls user endpoints and passes auth headers", async () => {
    await searchUsers("john doe");
    expect(api.get).toHaveBeenCalledWith("/users/search?query=john%20doe");

    await fetchAllUsers("tok", { page: 1 });
    expect(api.get).toHaveBeenCalledWith("/users", {
      headers: { Authorization: "Bearer tok" },
      params: { page: 1 },
    });

    await fetchUserById("u1", "tok");
    expect(api.get).toHaveBeenCalledWith("/users/u1", {
      headers: { Authorization: "Bearer tok" },
    });

    await fetchUserByUsername("harsh");
    expect(api.get).toHaveBeenCalledWith("/users/username/harsh");

    await deleteUserById("u1", "tok");
    expect(api.delete).toHaveBeenCalledWith("/users/u1", {
      headers: { Authorization: "Bearer tok" },
    });

    await updateUserRole("u1", "admin", "tok");
    expect(api.put).toHaveBeenCalledWith("/users/u1/role", { role: "admin" }, {
      headers: { Authorization: "Bearer tok" },
    });

    await fetchAdminAnalytics("tok");
    expect(api.get).toHaveBeenCalledWith("/users/analytics", {
      headers: { Authorization: "Bearer tok" },
    });

    await fetchMyProfile("tok");
    expect(api.get).toHaveBeenCalledWith("/users/me", {
      headers: { Authorization: "Bearer tok" },
    });

    const updatedUser = await updateMyProfile({ bio: "hi" }, "tok");
    expect(api.patch).toHaveBeenCalledWith("/users/me", { bio: "hi" }, {
      headers: { Authorization: "Bearer tok" },
    });
    expect(updatedUser).toEqual({ _id: "u1" });

    await updateSocialProfiles("tok");
    expect(api.get).toHaveBeenCalledWith("/users/update-social-stats", {
      headers: { Authorization: "Bearer tok" },
    });

    await updateCompetitiveStats("tok");
    expect(api.get).toHaveBeenCalledWith("/users/update-competitive-stats", {
      headers: { Authorization: "Bearer tok" },
    });

    await updateSingleSocialStat("github", "tok");
    expect(api.get).toHaveBeenCalledWith("/users/update-social-stats/github", {
      headers: { Authorization: "Bearer tok" },
    });

    await updateSingleCompetitiveStat("leetcode", "tok");
    expect(api.get).toHaveBeenCalledWith("/users/update-competitive-stats/leetcode", {
      headers: { Authorization: "Bearer tok" },
    });
  });

  it("rethrows errors from user API methods", async () => {
    const err = new Error("user failed");
    api.get.mockRejectedValue(err);
    api.put.mockRejectedValue(err);
    api.patch.mockRejectedValue(err);
    api.delete.mockRejectedValue(err);

    await expect(searchUsers("q")).rejects.toThrow("user failed");
    await expect(fetchAllUsers("tok")).rejects.toThrow("user failed");
    await expect(fetchUserById("u1", "tok")).rejects.toThrow("user failed");
    await expect(fetchUserByUsername("name")).rejects.toThrow("user failed");
    await expect(deleteUserById("u1", "tok")).rejects.toThrow("user failed");
    await expect(updateUserRole("u1", "admin", "tok")).rejects.toThrow("user failed");
    await expect(fetchAdminAnalytics("tok")).rejects.toThrow("user failed");
    await expect(fetchMyProfile("tok")).rejects.toThrow("user failed");
    await expect(updateMyProfile({ bio: "x" }, "tok")).rejects.toThrow("user failed");
    await expect(updateSocialProfiles("tok")).rejects.toThrow("user failed");
    await expect(updateCompetitiveStats("tok")).rejects.toThrow("user failed");
    await expect(updateSingleSocialStat("github", "tok")).rejects.toThrow("user failed");
    await expect(updateSingleCompetitiveStat("leetcode", "tok")).rejects.toThrow("user failed");
  });
});
