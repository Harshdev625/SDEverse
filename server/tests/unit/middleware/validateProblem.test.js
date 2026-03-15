const { runValidators } = require("./validatorTestHelper");
const { validateProblem } = require("../../../middleware/validateProblem");

// All fields in validateProblem are optional (checkFalsy), so the middleware
// only validates format/constraints when a field IS provided.
const chain = validateProblem.slice(0, -1);

describe("validateProblem middleware", () => {
  it("passes with an empty body (all fields optional)", async () => {
    const result = await runValidators(chain, {});
    expect(result.isEmpty()).toBe(true);
  });

  it("passes with a fully valid body", async () => {
    const body = {
      title: "Two Sum",
      difficulty: "easy",
      platform: "leetcode",
      platformLink: "https://leetcode.com/problems/two-sum",
      description: "Find two indices that add up to target value",
      tags: ["array", "hash-map"],
      hints: [{ content: "Use a hash map" }],
      solution: {
        content: {
          python: "def twoSum(nums, target): ...",
          javascript: "const twoSum = (nums, target) => ...",
        },
        explanation: "Use hash map for O(n) time",
      },
    };
    const result = await runValidators(chain, body);
    expect(result.isEmpty()).toBe(true);
  });

  it("fails when title is provided but too short (< 3 chars)", async () => {
    const result = await runValidators(chain, { title: "AB" });
    const paths = result.array().map((e) => e.path);
    expect(paths).toContain("title");
  });

  it("fails when difficulty is an invalid value", async () => {
    const result = await runValidators(chain, { difficulty: "extreme" });
    const paths = result.array().map((e) => e.path);
    expect(paths).toContain("difficulty");
  });

  it("passes when difficulty is a valid enum value", async () => {
    for (const d of ["easy", "medium", "hard"]) {
      const result = await runValidators(chain, { difficulty: d });
      expect(result.isEmpty()).toBe(true);
    }
  });

  it("fails when platform is invalid", async () => {
    const result = await runValidators(chain, { platform: "unknown-site" });
    const paths = result.array().map((e) => e.path);
    expect(paths).toContain("platform");
  });

  it("fails when platformLink does not start with http:// or https://", async () => {
    const result = await runValidators(chain, { platformLink: "ftp://example.com" });
    const paths = result.array().map((e) => e.path);
    expect(paths).toContain("platformLink");
  });

  it("passes when platformLink is a valid URL", async () => {
    const result = await runValidators(chain, {
      platformLink: "https://leetcode.com/problems/two-sum",
    });
    expect(result.isEmpty()).toBe(true);
  });

  it("fails when tags is not an array", async () => {
    const result = await runValidators(chain, { tags: "array" });
    const paths = result.array().map((e) => e.path);
    expect(paths).toContain("tags");
  });

  it("fails when description is too short", async () => {
    const result = await runValidators(chain, { description: "Short" });
    const paths = result.array().map((e) => e.path);
    expect(paths).toContain("description");
  });
});
