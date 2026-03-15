
vi.mock("mongoose");
vi.mock("../../../models/bookmark.model");
vi.mock("../../../models/blog.model");
vi.mock("../../../models/algorithm.model");
vi.mock("../../../models/dataStructure.model");

const Bookmark = require("../../../models/bookmark.model");
const {
  getBookmark,
  setBookmark,
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
});
