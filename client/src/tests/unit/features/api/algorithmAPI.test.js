vi.mock("../../../../utils/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from "../../../../utils/api";
import {
  createAlgorithm,
  getAllAlgorithms,
  getAlgorithmsForList,
  getAlgorithmBySlug,
  updateAlgorithm,
  deleteAlgorithm,
  voteAlgorithm,
  getCategories,
  searchAlgorithms,
} from "../../../../features/algorithm/algorithmAPI";

describe("features/algorithm/algorithmAPI", () => {
  beforeEach(() => vi.clearAllMocks());

  it("calls CRUD endpoints", async () => {
    api.post.mockResolvedValue({ data: { id: 1 } });
    api.put.mockResolvedValue({ data: { id: 1 } });
    api.delete.mockResolvedValue({ data: { ok: true } });
    api.get.mockResolvedValue({ data: { slug: "two-sum" } });

    await createAlgorithm({ title: "A" });
    expect(api.post).toHaveBeenCalledWith("/algorithms", { title: "A" });

    await getAlgorithmBySlug("two-sum");
    expect(api.get).toHaveBeenCalledWith("/algorithms/two-sum");

    await updateAlgorithm("two-sum", { title: "B" });
    expect(api.put).toHaveBeenCalledWith("/algorithms/two-sum", { title: "B" });

    await deleteAlgorithm("two-sum");
    expect(api.delete).toHaveBeenCalledWith("/algorithms/two-sum");

    await voteAlgorithm("two-sum", { voteType: "upvote" });
    expect(api.post).toHaveBeenCalledWith("/algorithms/two-sum/vote", { voteType: "upvote" });

    await getCategories();
    expect(api.get).toHaveBeenCalledWith("/algorithms/categories");
  });

  it("maps list/search response shapes", async () => {
    api.get
      .mockResolvedValueOnce({ data: { algorithms: [{ slug: "a" }], total: 1, pages: 1, currentPage: 1 } })
      .mockResolvedValueOnce({ data: { algorithms: [{ slug: "a" }], total: 1 } })
      .mockResolvedValueOnce({ data: { results: [{ slug: "a" }], total: 1, pages: 1, currentPage: 1 } });

    const all = await getAllAlgorithms({ page: 2 });
    expect(api.get).toHaveBeenCalledWith("/algorithms", { params: { page: 2 } });
    expect(all.algorithms).toEqual([{ slug: "a" }]);

    const list = await getAlgorithmsForList({ q: "two" });
    expect(api.get).toHaveBeenCalledWith("/algorithms/list", { params: { q: "two" } });
    expect(list.total).toBe(1);

    const search = await searchAlgorithms({ q: "sum" });
    expect(api.get).toHaveBeenCalledWith("/algorithms/search", { params: { q: "sum" } });
    expect(search.algorithms).toEqual([{ slug: "a" }]);
  });
});
