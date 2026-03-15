
vi.mock("mongoose");
vi.mock("../../../models/bookmark.model");
vi.mock("../../../models/blog.model");
vi.mock("../../../models/algorithm.model");
vi.mock("../../../models/dataStructure.model");

const mongoose = require("mongoose");
const Bookmark = require("../../../models/bookmark.model");
const Algorithm = require("../../../models/algorithm.model");
const Blog = require("../../../models/blog.model");
const DataStructure = require("../../../models/dataStructure.model");
const {
  getBookmark,
  setBookmark,
  deleteBookmark,
  getAllMyBookmarks,
} = require("../../../controllers/bookmark.controller");

Bookmark.ALLOWED_PARENT_TYPES = ["Algorithm", "DataStructure", "Blog"];

function makeRes() {
  const json = vi.fn();
  const res = { status: vi.fn(() => res), json };
  return res;
}

describe("bookmark.controller – getBookmark", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when user id is missing", async () => {
    const req = { user: {}, params: {} };
    const res = makeRes();
    await getBookmark(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 when parentType and parentId params are missing", async () => {
    const req = { user: { id: "u1" }, params: {} };
    const res = makeRes();
    await getBookmark(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 for an invalid parentType", async () => {
    const req = { user: { id: "u1" }, params: { parentType: "InvalidType", parentId: "p1" } };
    const res = makeRes();
    await getBookmark(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns empty payload when bookmark does not exist", async () => {
    Bookmark.findOne = vi.fn().mockResolvedValue(null);
    const req = {
      user: { id: "u1" },
      params: { parentType: "Algorithm", parentId: "alg1" },
    };
    const res = makeRes();
    await getBookmark(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ _id: null, user: "u1" })
    );
  });

  it("returns bookmark when it exists", async () => {
    const fakeBM = { _id: "bm1", parentType: "Algorithm", parentId: "alg1" };
    Bookmark.findOne = vi.fn().mockResolvedValue(fakeBM);
    const req = {
      user: { id: "u1" },
      params: { parentType: "Algorithm", parentId: "alg1" },
    };
    const res = makeRes();
    await getBookmark(req, res);
    expect(res.json).toHaveBeenCalledWith(fakeBM);
  });
});

describe("bookmark.controller – setBookmark", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when user is not authenticated", async () => {
    const req = { user: {}, body: {} };
    const res = makeRes();
    await setBookmark(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 400 when parentType/parentId missing", async () => {
    const req = { user: { id: "u1" }, body: {} };
    const res = makeRes();
    await setBookmark(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 for invalid parentType", async () => {
    const req = {
      user: { id: "u1" },
      body: { parentType: "BadType", parentId: "p1" },
    };
    const res = makeRes();
    await setBookmark(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("updates an existing bookmark with resolved parent metadata", async () => {
    const existing = { link: "", title: "", save: vi.fn().mockResolvedValue(true) };
    Bookmark.findOne = vi.fn().mockResolvedValue(existing);
    Algorithm.findById = vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue({ slug: "two-sum", title: "Two Sum" }) });
    const req = {
      user: { id: "u1" },
      body: { parentType: "Algorithm", parentId: "alg1" },
    };
    const res = makeRes();
    await setBookmark(req, res);
    expect(existing.link).toBe("/algorithms/two-sum");
    expect(existing.title).toBe("Two Sum");
    expect(existing.save).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("creates a new bookmark when one does not exist", async () => {
    Bookmark.findOne = vi.fn().mockResolvedValue(null);
    Blog.findById = vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue({ slug: "blog-1", title: "Blog 1" }) });
    Bookmark.create = vi.fn().mockResolvedValue({ _id: "b1" });
    const req = {
      user: { id: "u1" },
      body: { parentType: "Blog", parentId: "blog1" },
    };
    const res = makeRes();
    await setBookmark(req, res);
    expect(Bookmark.create).toHaveBeenCalledWith(
      expect.objectContaining({ user: "u1", parentType: "Blog", parentId: "blog1", link: "/blogs/blog-1", title: "Blog 1" })
    );
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("returns existing bookmark on duplicate-key fallback", async () => {
    const duplicateError = Object.assign(new Error("duplicate"), { code: 11000 });
    Bookmark.findOne = vi.fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ _id: "existing-bookmark" });
    DataStructure.findById = vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue({ slug: "heap", title: "Heap" }) });
    Bookmark.create = vi.fn().mockRejectedValue(duplicateError);
    const req = {
      user: { id: "u1" },
      body: { parentType: "DataStructure", parentId: "ds1" },
    };
    const res = makeRes();
    await setBookmark(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ _id: "existing-bookmark" });
  });

  it("returns 500 when create/update fails without fallback result", async () => {
    Bookmark.findOne = vi.fn().mockResolvedValue(null);
    Algorithm.findById = vi.fn().mockReturnValue({ select: vi.fn().mockResolvedValue(null) });
    Bookmark.create = vi.fn().mockRejectedValue(new Error("db down"));
    const req = {
      user: { id: "u1" },
      body: { parentType: "Algorithm", parentId: "alg1" },
    };
    const res = makeRes();
    await setBookmark(req, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});

describe("bookmark.controller – deleteBookmark", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when user id is missing", async () => {
    const res = makeRes();
    await deleteBookmark({ user: {}, params: {} }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 for invalid parent type", async () => {
    const res = makeRes();
    await deleteBookmark({ user: { id: "u1" }, params: { parentType: "Bad", parentId: "p1" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns message when bookmark is not found", async () => {
    Bookmark.findOneAndDelete = vi.fn().mockResolvedValue(null);
    const res = makeRes();
    await deleteBookmark({ user: { id: "u1" }, params: { parentType: "Algorithm", parentId: "alg1" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("deletes bookmark successfully", async () => {
    Bookmark.findOneAndDelete = vi.fn().mockResolvedValue({ _id: "bm1" });
    const res = makeRes();
    await deleteBookmark({ user: { id: "u1" }, params: { parentType: "Algorithm", parentId: "alg1" } }, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Bookmark deleted successfully", id: "bm1" });
  });
});

describe("bookmark.controller – getAllMyBookmarks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mongoose.Types.ObjectId = function ObjectId(value) { this.value = value; };
    mongoose.Types.ObjectId.isValid = vi.fn().mockReturnValue(true);
  });

  it("returns 401 when user is not authenticated", async () => {
    const res = makeRes();
    await getAllMyBookmarks({ user: {}, query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 400 for invalid parentType filter", async () => {
    const res = makeRes();
    await getAllMyBookmarks({ user: { id: "u1" }, query: { parentType: "Bad" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 for invalid user id when aggregate branch is used", async () => {
    mongoose.Types.ObjectId.isValid = vi.fn().mockReturnValue(false);
    const res = makeRes();
    await getAllMyBookmarks({ user: { id: "bad-id" }, query: { parentType: "Algorithm" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns aggregated bookmarks with parentType filter and search", async () => {
    Bookmark.aggregate = vi.fn()
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([{ _id: "bm1", parentType: "Algorithm", parent: { slug: "two-sum", title: "Two Sum" } }]);
    const res = makeRes();
    await getAllMyBookmarks({ user: { id: "507f1f77bcf86cd799439011" }, query: { parentType: "Algorithm", q: "two", page: "1", limit: "10" } }, res);
    expect(Bookmark.aggregate).toHaveBeenCalledTimes(2);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ total: 1, bookmarks: [expect.objectContaining({ link: "/algorithms/two-sum", title: "Two Sum" })] })
    );
  });

  it("returns populated bookmarks without parentType filter", async () => {
    Bookmark.find = vi.fn().mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockResolvedValue([
        {
          parentId: { title: "Blog 1", slug: "blog-1" },
          toObject: () => ({ _id: "bm1", parentType: "Blog", parentId: { title: "Blog 1", slug: "blog-1" }, link: "", title: "" }),
        },
      ]),
    });
    const res = makeRes();
    await getAllMyBookmarks({ user: { id: "u1" }, query: { q: "blog", page: "1", limit: "10" } }, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ total: 1, bookmarks: [expect.objectContaining({ link: "/blogs/blog-1", title: "Blog 1" })] })
    );
  });
});
