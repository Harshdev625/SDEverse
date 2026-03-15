const Algorithm = require("../../../models/algorithm.model");
const generateUniqueSlug = require("../../../utils/generateUniqueSlug");

describe("generateUniqueSlug", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns base slug when no collision exists", async () => {
    vi.spyOn(Algorithm, "findOne").mockResolvedValue(null);

    const slug = await generateUniqueSlug("Dijkstra Algorithm");

    expect(slug).toBe("dijkstra-algorithm");
    expect(Algorithm.findOne).toHaveBeenCalledWith({ slug: "dijkstra-algorithm" });
  });

  it("appends incrementing suffix when collisions exist", async () => {
    vi.spyOn(Algorithm, "findOne")
      .mockResolvedValueOnce({ _id: "1" })
      .mockResolvedValueOnce({ _id: "2" })
      .mockResolvedValueOnce(null);

    const slug = await generateUniqueSlug("Dijkstra Algorithm");

    expect(slug).toBe("dijkstra-algorithm-2");
    expect(Algorithm.findOne).toHaveBeenNthCalledWith(1, { slug: "dijkstra-algorithm" });
    expect(Algorithm.findOne).toHaveBeenNthCalledWith(2, { slug: "dijkstra-algorithm-1" });
    expect(Algorithm.findOne).toHaveBeenNthCalledWith(3, { slug: "dijkstra-algorithm-2" });
  });
});
