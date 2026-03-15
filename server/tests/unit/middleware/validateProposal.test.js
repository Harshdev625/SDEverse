const { runValidators } = require("./validatorTestHelper");
const validateProposal = require("../../../middleware/validateProposal");

describe("validateProposal middleware – create mode", () => {
  const chain = validateProposal("create").slice(0, -1); // exclude final handler

  it("passes with all required create fields", async () => {
    const body = {
      title: "Binary Search",
      problemStatement: "Find element in sorted array",
      intuition: "Halve the search space",
      explanation: "Compare mid element",
      complexity: { time: "O(log n)", space: "O(1)" },
      category: ["searching"],
    };
    const result = await runValidators(chain, body);
    expect(result.isEmpty()).toBe(true);
  });

  it("fails when required fields are missing in create mode", async () => {
    const result = await runValidators(chain, {});
    const paths = result.array().map((e) => e.path);
    expect(paths).toContain("title");
    expect(paths).toContain("problemStatement");
    expect(paths).toContain("intuition");
    expect(paths).toContain("explanation");
  });

  it("fails when category is empty array in create mode", async () => {
    const body = {
      title: "Sort",
      problemStatement: "stmt",
      intuition: "intuition",
      explanation: "explanation",
      complexity: { time: "O(n)", space: "O(1)" },
      category: [],
    };
    const result = await runValidators(chain, body);
    const paths = result.array().map((e) => e.path);
    expect(paths).toContain("category");
  });

  it("final handler returns 400 when validation fails in create mode", async () => {
    const req = { body: {}, headers: {}, params: {}, query: {} };
    const json = vi.fn();
    const res = { status: vi.fn(() => ({ json })) };

    for (const mw of validateProposal("create")) {
      await new Promise((resolve) => {
        const r = mw(req, res, resolve);
        if (r && typeof r.then === "function") r.then(resolve).catch(resolve);
        else if (json.mock.calls.length > 0) resolve();
      });
      if (json.mock.calls.length > 0) break;
    }

    expect(res.status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Array) }));
  });
});

describe("validateProposal middleware – update mode", () => {
  const chain = validateProposal("update").slice(0, -1);

  it("passes with empty body in update mode (all fields optional)", async () => {
    const result = await runValidators(chain, {});
    expect(result.isEmpty()).toBe(true);
  });

  it("passes with partial fields in update mode", async () => {
    const result = await runValidators(chain, { title: "Updated Title" });
    expect(result.isEmpty()).toBe(true);
  });

  it("passes with full payload in update mode", async () => {
    const body = {
      title: "Merge Sort",
      problemStatement: "Sort an array",
      intuition: "Divide and conquer",
      explanation: "Split, sort, merge",
      complexity: { time: "O(n log n)", space: "O(n)" },
      category: ["sorting"],
      tags: ["sorting", "divide"],
      codes: [],
      links: [],
    };
    const result = await runValidators(chain, body);
    expect(result.isEmpty()).toBe(true);
  });
});
