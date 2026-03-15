vi.mock("../../../../utils/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from "../../../../utils/api";
import {
  getBookmarkByParent,
  upsertBookmark,
  deleteBookmarkByParent,
  getMyBookmarks,
} from "../../../../features/bookmark/bookmarkAPI";

describe("features/bookmark/bookmarkAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { ok: true } });
    api.post.mockResolvedValue({ data: { ok: true } });
    api.delete.mockResolvedValue({ data: { ok: true } });
  });

  it("calls bookmark parent endpoints", async () => {
    await getBookmarkByParent("algorithm", "a1");
    expect(api.get).toHaveBeenCalledWith("/bookmarks/parent/algorithm/a1");

    await upsertBookmark({ parentType: "algorithm", parentId: "a1" });
    expect(api.post).toHaveBeenCalledWith("/bookmarks", { parentType: "algorithm", parentId: "a1" });

    await deleteBookmarkByParent("algorithm", "a1");
    expect(api.delete).toHaveBeenCalledWith("/bookmarks/parent/algorithm/a1");
  });

  it("builds my bookmarks query string including optional fields", async () => {
    await getMyBookmarks(2, 24, "two sum", "algorithm");
    expect(api.get).toHaveBeenCalledWith("/bookmarks/my?page=2&limit=24&q=two%20sum&parentType=algorithm");
  });

  it("rethrows errors from bookmark API", async () => {
    const err = new Error("bookmark failed");
    api.get.mockRejectedValue(err);
    api.post.mockRejectedValue(err);
    api.delete.mockRejectedValue(err);

    await expect(getBookmarkByParent("algorithm", "a1")).rejects.toThrow("bookmark failed");
    await expect(upsertBookmark({})).rejects.toThrow("bookmark failed");
    await expect(deleteBookmarkByParent("algorithm", "a1")).rejects.toThrow("bookmark failed");
    await expect(getMyBookmarks()).rejects.toThrow("bookmark failed");
  });
});
