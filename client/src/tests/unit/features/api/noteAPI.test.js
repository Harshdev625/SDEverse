vi.mock("../../../../utils/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from "../../../../utils/api";
import { getNoteByParent, upsertNote, deleteNoteByParent, getMyNotes } from "../../../../features/note/noteAPI";

describe("features/note/noteAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { ok: true } });
    api.post.mockResolvedValue({ data: { ok: true } });
    api.delete.mockResolvedValue({ data: { ok: true } });
  });

  it("calls note endpoints", async () => {
    await getNoteByParent("algorithm", "a1");
    expect(api.get).toHaveBeenCalledWith("/notes/parent/algorithm/a1");

    await upsertNote({ parentType: "algorithm", parentId: "a1", note: "hi" });
    expect(api.post).toHaveBeenCalledWith("/notes", { parentType: "algorithm", parentId: "a1", note: "hi" });

    await deleteNoteByParent("algorithm", "a1");
    expect(api.delete).toHaveBeenCalledWith("/notes/parent/algorithm/a1");

    await getMyNotes(2, 15, "graph", "algorithm");
    expect(api.get).toHaveBeenCalledWith("/notes/my?page=2&limit=15&q=graph&parentType=algorithm");
  });

  it("rethrows errors from note API", async () => {
    const err = new Error("note failed");
    api.get.mockRejectedValue(err);
    api.post.mockRejectedValue(err);
    api.delete.mockRejectedValue(err);

    await expect(getNoteByParent("algorithm", "a1")).rejects.toThrow("note failed");
    await expect(upsertNote({})).rejects.toThrow("note failed");
    await expect(deleteNoteByParent("algorithm", "a1")).rejects.toThrow("note failed");
    await expect(getMyNotes()).rejects.toThrow("note failed");
  });
});
