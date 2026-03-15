vi.mock("../../../../utils/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from "../../../../utils/api";
import {
  addComment,
  getCommentsByParent,
  addReplyToComment,
  deleteComment,
} from "../../../../features/comment/commentAPI";

describe("features/comment/commentAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { ok: true } });
    api.post.mockResolvedValue({ data: { ok: true } });
    api.delete.mockResolvedValue({ data: { ok: true } });
  });

  it("calls comment endpoints correctly", async () => {
    await addComment({ parentId: "p1", text: "Nice" });
    expect(api.post).toHaveBeenCalledWith("/comments", { parentId: "p1", text: "Nice" });

    await getCommentsByParent("blog", "b1");
    expect(api.get).toHaveBeenCalledWith("/comments/blog/b1");

    await addReplyToComment("c1", { text: "reply" });
    expect(api.post).toHaveBeenCalledWith("/comments/c1/reply", { text: "reply" });

    await deleteComment("c1");
    expect(api.delete).toHaveBeenCalledWith("/comments/c1");
  });

  it("rethrows errors from comment endpoints", async () => {
    const err = new Error("comment failed");
    api.post.mockRejectedValue(err);
    api.get.mockRejectedValue(err);
    api.delete.mockRejectedValue(err);

    await expect(addComment({ text: "x" })).rejects.toThrow("comment failed");
    await expect(getCommentsByParent("blog", "b1")).rejects.toThrow("comment failed");
    await expect(addReplyToComment("c1", { text: "r" })).rejects.toThrow("comment failed");
    await expect(deleteComment("c1")).rejects.toThrow("comment failed");
  });
});
