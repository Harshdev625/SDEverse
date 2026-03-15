vi.mock("../../../../utils/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from "../../../../utils/api";
import {
  getAllBlogs,
  getBlogBySlug,
  getBlogForEdit,
  getBlogsByAuthor,
  createBlog,
  updateBlog,
  deleteBlog,
  likeBlog,
  getMyBlogs,
  getDraftBlogs,
  publishBlog,
  rejectBlog,
  getBlogCategories,
  getPopularTags,
} from "../../../../features/blog/blogAPI";

describe("features/blog/blogAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { ok: true } });
    api.post.mockResolvedValue({ data: { ok: true } });
    api.put.mockResolvedValue({ data: { ok: true } });
    api.delete.mockResolvedValue({ data: { ok: true } });
  });

  it("hits all blog endpoints with proper method/path", async () => {
    await getAllBlogs({ page: 1 });
    expect(api.get).toHaveBeenCalledWith("/blogs", { params: { page: 1 } });
    await getBlogBySlug("slug-1");
    expect(api.get).toHaveBeenCalledWith("/blogs/slug-1");
    await getBlogForEdit("slug-1");
    expect(api.get).toHaveBeenCalledWith("/blogs/user/slug-1");
    await getBlogsByAuthor("harsh");
    expect(api.get).toHaveBeenCalledWith("/blogs/author/harsh");

    await createBlog({ title: "T" });
    expect(api.post).toHaveBeenCalledWith("/blogs", { title: "T" });
    await updateBlog("slug-1", { title: "U" });
    expect(api.put).toHaveBeenCalledWith("/blogs/slug-1", { title: "U" });
    await deleteBlog("slug-1");
    expect(api.delete).toHaveBeenCalledWith("/blogs/slug-1");
    await likeBlog("slug-1");
    expect(api.post).toHaveBeenCalledWith("/blogs/slug-1/like", {});

    await getMyBlogs();
    expect(api.get).toHaveBeenCalledWith("/blogs/user/my-blogs");
    await getDraftBlogs({ page: 2 });
    expect(api.get).toHaveBeenCalledWith("/blogs/admin/drafts", { params: { page: 2 } });
    await publishBlog("slug-1");
    expect(api.put).toHaveBeenCalledWith("/blogs/admin/slug-1/publish");
    await rejectBlog("slug-1");
    expect(api.delete).toHaveBeenCalledWith("/blogs/admin/slug-1/reject");
    await getBlogCategories();
    expect(api.get).toHaveBeenCalledWith("/blogs/categories");
    await getPopularTags();
    expect(api.get).toHaveBeenCalledWith("/blogs/tags");
  });

  it("rethrows errors for blog endpoints", async () => {
    const err = new Error("blog failed");
    api.get.mockRejectedValue(err);
    api.post.mockRejectedValue(err);
    api.put.mockRejectedValue(err);
    api.delete.mockRejectedValue(err);

    await expect(getAllBlogs()).rejects.toThrow("blog failed");
    await expect(getBlogBySlug("s")).rejects.toThrow("blog failed");
    await expect(getBlogForEdit("s")).rejects.toThrow("blog failed");
    await expect(getBlogsByAuthor("u")).rejects.toThrow("blog failed");
    await expect(createBlog({})).rejects.toThrow("blog failed");
    await expect(updateBlog("s", {})).rejects.toThrow("blog failed");
    await expect(deleteBlog("s")).rejects.toThrow("blog failed");
    await expect(likeBlog("s")).rejects.toThrow("blog failed");
    await expect(getMyBlogs()).rejects.toThrow("blog failed");
    await expect(getDraftBlogs()).rejects.toThrow("blog failed");
    await expect(publishBlog("s")).rejects.toThrow("blog failed");
    await expect(rejectBlog("s")).rejects.toThrow("blog failed");
    await expect(getBlogCategories()).rejects.toThrow("blog failed");
    await expect(getPopularTags()).rejects.toThrow("blog failed");
  });
});
