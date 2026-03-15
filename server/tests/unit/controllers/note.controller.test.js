
vi.mock("mongoose");
vi.mock("../../../models/note.model");

const mongoose = require("mongoose");
const Note = require("../../../models/note.model");
const {
  getNote,
  setNote,
  deleteNote,
  getAllMyNotes,
} = require("../../../controllers/note.controller");

Note.ALLOWED_PARENT_TYPES = ["Algorithm", "DataStructure"];

function makeRes() {
  const json = vi.fn();
  const res = { status: vi.fn(() => res), json };
  return res;
}

describe("note.controller – getNote", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when user id is missing", async () => {
    const req = { user: {}, params: {} };
    const res = makeRes();
    await getNote(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 when parentType and parentId are missing from params", async () => {
    const req = { user: { id: "u1" }, params: {} };
    const res = makeRes();
    await getNote(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("parentType") })
    );
  });

  it("returns 400 for invalid parentType", async () => {
    const req = { user: { id: "u1" }, params: { parentType: "Blog", parentId: "p1" } };
    const res = makeRes();
    await getNote(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns empty payload when note does not exist", async () => {
    Note.findOne = vi.fn().mockResolvedValue(null);
    const req = {
      user: { id: "u1" },
      params: { parentType: "Algorithm", parentId: "alg1" },
    };
    const res = makeRes();
    await getNote(req, res);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ _id: null, content: "" })
    );
  });

  it("returns note when it exists", async () => {
    const fakeNote = { _id: "n1", content: "My note" };
    Note.findOne = vi.fn().mockResolvedValue(fakeNote);
    const req = {
      user: { id: "u1" },
      params: { parentType: "Algorithm", parentId: "alg1" },
    };
    const res = makeRes();
    await getNote(req, res);
    expect(res.json).toHaveBeenCalledWith(fakeNote);
  });
});

describe("note.controller – setNote", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 401 when user is not authenticated", async () => {
    const req = { user: {}, body: {} };
    const res = makeRes();
    await setNote(req, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 400 when parentType and parentId are missing from body", async () => {
    const req = { user: { id: "u1" }, body: {} };
    const res = makeRes();
    await setNote(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 for invalid parentType", async () => {
    const req = {
      user: { id: "u1" },
      body: { parentType: "Unknonwn", parentId: "p1" },
    };
    const res = makeRes();
    await setNote(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("upserts note and returns 200", async () => {
    const savedNote = { _id: "n1", content: "Hello" };
    Note.findOneAndUpdate = vi.fn().mockResolvedValue(savedNote);
    const req = {
      user: { id: "u1" },
      body: { parentType: "Algorithm", parentId: "alg1", content: "Hello" },
    };
    const res = makeRes();
    await setNote(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(savedNote);
  });
});

describe("note.controller – deleteNote", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns 400 when user id is missing", async () => {
    const req = { user: {}, params: {} };
    const res = makeRes();
    await deleteNote(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 when params are missing", async () => {
    const req = { user: { id: "u1" }, params: {} };
    const res = makeRes();
    await deleteNote(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 for invalid parentType", async () => {
    const req = { user: { id: "u1" }, params: { parentType: "Blog", parentId: "b1" } };
    const res = makeRes();
    await deleteNote(req, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns message when no note exists", async () => {
    Note.findOneAndDelete = vi.fn().mockResolvedValue(null);
    const req = { user: { id: "u1" }, params: { parentType: "Algorithm", parentId: "alg1" } };
    const res = makeRes();
    await deleteNote(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
  });

  it("deletes note successfully", async () => {
    Note.findOneAndDelete = vi.fn().mockResolvedValue({ _id: "n1" });
    const req = { user: { id: "u1" }, params: { parentType: "Algorithm", parentId: "alg1" } };
    const res = makeRes();
    await deleteNote(req, res);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ message: "Note deleted successfully", id: "n1" });
  });
});

describe("note.controller – getAllMyNotes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mongoose.Types.ObjectId = function ObjectId(value) { this.value = value; };
    mongoose.Types.ObjectId.isValid = vi.fn().mockReturnValue(true);
  });

  it("returns 401 when user is not authenticated", async () => {
    const res = makeRes();
    await getAllMyNotes({ user: {}, query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it("returns 400 for invalid parentType filter", async () => {
    const res = makeRes();
    await getAllMyNotes({ user: { id: "u1" }, query: { parentType: "Blog" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns 400 for invalid user id in aggregate branch", async () => {
    mongoose.Types.ObjectId.isValid = vi.fn().mockReturnValue(false);
    const res = makeRes();
    await getAllMyNotes({ user: { id: "bad-id" }, query: { parentType: "Algorithm" } }, res);
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("returns aggregated notes for filtered parent type", async () => {
    Note.aggregate = vi.fn()
      .mockResolvedValueOnce([{ count: 1 }])
      .mockResolvedValueOnce([{ _id: "n1", content: "Use two pointers", parentType: "Algorithm", parent: { title: "Two Sum", slug: "two-sum" } }]);
    const res = makeRes();
    await getAllMyNotes({ user: { id: "507f1f77bcf86cd799439011" }, query: { parentType: "Algorithm", q: "two", page: "1", limit: "10" } }, res);
    expect(Note.aggregate).toHaveBeenCalledTimes(2);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ total: 1, notes: [expect.objectContaining({ _id: "n1", parentId: expect.objectContaining({ slug: "two-sum" }) })] })
    );
  });

  it("returns populated notes without filter and applies content search", async () => {
    Note.countDocuments = vi.fn().mockResolvedValue(1);
    Note.find = vi.fn().mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockResolvedValue([
        {
          content: "Binary search note",
          toObject: () => ({ _id: "n1", content: "Binary search note", parentType: "Algorithm", parentId: { title: "Binary Search", slug: "binary-search" } }),
        },
      ]),
    });
    const res = makeRes();
    await getAllMyNotes({ user: { id: "u1" }, query: { q: "binary", page: "1", limit: "10" } }, res);
    expect(Note.countDocuments).toHaveBeenCalledWith({ user: "u1" });
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ total: 1, notes: [expect.objectContaining({ content: "Binary search note" })] })
    );
  });

  it("returns 500 when listing notes fails", async () => {
    Note.countDocuments = vi.fn().mockRejectedValue(new Error("db down"));
    const res = makeRes();
    await getAllMyNotes({ user: { id: "u1" }, query: {} }, res);
    expect(res.status).toHaveBeenCalledWith(500);
  });
});
