vi.mock("../../../../utils/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from "../../../../utils/api";
import {
  createDataStructure,
  getAllDataStructures,
  getAllDataStructuresForList,
  getDataStructureBySlug,
  updateDataStructure,
  deleteDataStructure,
  voteDataStructure,
  getDataStructureCategories,
  searchDataStructures,
  addOperationImplementation,
  getDataStructureContributors,
} from "../../../../features/dataStructure/dataStructureAPI";

describe("features/dataStructure/dataStructureAPI", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls CRUD and related endpoints", async () => {
    api.post.mockResolvedValue({ data: { ok: true } });
    api.put.mockResolvedValue({ data: { ok: true } });
    api.delete.mockResolvedValue({ data: { ok: true } });
    api.get.mockResolvedValue({ data: { ok: true } });

    await createDataStructure({ title: "BST" });
    expect(api.post).toHaveBeenCalledWith("/data-structures", { title: "BST" });

    await getDataStructureBySlug("bst");
    expect(api.get).toHaveBeenCalledWith("/data-structures/bst");

    await updateDataStructure("bst", { title: "BST Updated" });
    expect(api.put).toHaveBeenCalledWith("/data-structures/bst", { title: "BST Updated" });

    await deleteDataStructure("bst");
    expect(api.delete).toHaveBeenCalledWith("/data-structures/bst");

    await voteDataStructure("bst", { voteType: "upvote" });
    expect(api.post).toHaveBeenCalledWith("/data-structures/bst/vote", { voteType: "upvote" });

    await getDataStructureCategories();
    expect(api.get).toHaveBeenCalledWith("/data-structures/categories");

    await addOperationImplementation("bst", { language: "js" });
    expect(api.post).toHaveBeenCalledWith("/data-structures/bst/code", { language: "js" });

    await getDataStructureContributors("bst");
    expect(api.get).toHaveBeenCalledWith("/data-structures/bst/contributors");
  });

  it("maps pagination and search payloads", async () => {
    api.get
      .mockResolvedValueOnce({ data: { dataStructures: [{ slug: "bst" }], total: 1, pages: 1, currentPage: 1 } })
      .mockResolvedValueOnce({ data: { dataStructures: [{ slug: "bst" }], total: 1 } })
      .mockResolvedValueOnce({ data: { results: [{ slug: "bst" }], total: 1, pages: 1, currentPage: 1 } });

    const all = await getAllDataStructures({ page: 1 });
    expect(api.get).toHaveBeenCalledWith("/data-structures", { params: { page: 1 } });
    expect(all.dataStructures).toEqual([{ slug: "bst" }]);

    const list = await getAllDataStructuresForList({ q: "tree" });
    expect(api.get).toHaveBeenCalledWith("/data-structures/list", { params: { q: "tree" } });
    expect(list.total).toBe(1);

    const search = await searchDataStructures({ q: "heap" });
    expect(api.get).toHaveBeenCalledWith("/data-structures/search", { params: { q: "heap" } });
    expect(search.dataStructures).toEqual([{ slug: "bst" }]);
  });
});
