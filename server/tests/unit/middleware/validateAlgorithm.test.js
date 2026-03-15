const { runValidators } = require("./validatorTestHelper");
const validateAlgorithm = require("../../../middleware/validateAlgorithm");

// The last middleware in validateAlgorithm writes the 400 response, so we
// need a minimal res mock when testing the compile step via full middleware chain.
function makeRes() {
  const json = vi.fn();
  const res = { status: vi.fn(() => ({ json })), __json: json };
  return res;
}

// Helper: run only the express-validator body() chains (exclude the final handler)
// so we can test validation logic independently.
const validatorChain = validateAlgorithm.slice(0, -1);

describe("validateAlgorithm middleware", () => {
  it("passes with all required fields", async () => {
    const body = {
      title: "Bubble Sort",
      problemStatement: "Sort an array",
      intuition: "Compare adjacent elements",
      explanation: "Repeatedly swap adjacent elements",
      complexity: { time: "O(n²)", space: "O(1)" },
    };
    const result = await runValidators(validatorChain, body);
    expect(result.isEmpty()).toBe(true);
  });

  it("fails when title is empty", async () => {
    const body = {
      title: "",
      problemStatement: "Sort an array",
      intuition: "Compare adjacent elements",
      explanation: "Detail",
      complexity: { time: "O(n²)", space: "O(1)" },
    };
    const result = await runValidators(validatorChain, body);
    const errors = result.array();
    expect(errors.some((e) => e.path === "title")).toBe(true);
  });

  it("fails when required fields are absent", async () => {
    const result = await runValidators(validatorChain, {});
    const errors = result.array();
    const paths = errors.map((e) => e.path);
    expect(paths).toContain("title");
    expect(paths).toContain("problemStatement");
    expect(paths).toContain("intuition");
    expect(paths).toContain("explanation");
  });

  it("fails when complexity.time is missing", async () => {
    const body = {
      title: "Quick Sort",
      problemStatement: "Sort",
      intuition: "Pivot element",
      explanation: "Divide & conquer",
      complexity: { space: "O(log n)" },
    };
    const result = await runValidators(validatorChain, body);
    const paths = result.array().map((e) => e.path);
    expect(paths.some((p) => p.includes("time"))).toBe(true);
  });

  it("final handler returns 400 with errors when validation fails", async () => {
    const req = { body: {}, headers: {}, params: {}, query: {} };
    const json = vi.fn();
    const statusResult = { json };
    const res = { status: vi.fn(() => statusResult) };

    // Run full chain — the final handler calls res.status().json(), not next()
    for (const mw of validateAlgorithm) {
      await new Promise((resolve) => {
        const r = mw(req, res, resolve);
        // If the middleware wrote a response synchronously, resolve immediately
        if (r && typeof r.then === "function") r.then(resolve).catch(resolve);
        else if (json.mock.calls.length > 0) resolve();
      });
      if (json.mock.calls.length > 0) break; // response written, stop chain
    }

    expect(res.status).toHaveBeenCalledWith(400);
    expect(json).toHaveBeenCalledWith(expect.objectContaining({ errors: expect.any(Array) }));
  });
});
