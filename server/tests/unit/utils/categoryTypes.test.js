const categories = require("../../../utils/categoryTypes");

describe("categoryTypes", () => {
  it("exports algorithm and data structure arrays", () => {
    expect(Array.isArray(categories.ALGORITHM)).toBe(true);
    expect(Array.isArray(categories.DATA_STRUCTURE)).toBe(true);
  });

  it("contains key expected categories", () => {
    expect(categories.ALGORITHM).toContain("Dynamic Programming");
    expect(categories.ALGORITHM).toContain("Graph");
    expect(categories.DATA_STRUCTURE).toContain("Trie");
    expect(categories.DATA_STRUCTURE).toContain("Hash Table");
  });
});
