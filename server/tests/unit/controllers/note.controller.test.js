
vi.mock("mongoose");
vi.mock("../../../models/note.model");

const Note = require("../../../models/note.model");
const {
  getNote,
  setNote,
  deleteNote,
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
});
