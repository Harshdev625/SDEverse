const { runValidators } = require("./validatorTestHelper");
const validateDataStructure = require("../../../middleware/validateDataStructure");

// Exclude the final handler from the chain for pure validation testing
const chain = Array.isArray(validateDataStructure)
  ? validateDataStructure.slice(0, -1)
  : validateDataStructure;

const validBody = {
  title: "Linked List",
  definition: "A linear data structure where each element points to the next",
  category: ["linear"],
  type: "singly",
  characteristics: "Dynamic size, efficient insertion",
};

describe("validateDataStructure middleware", () => {
  it("passes with all required fields", async () => {
    const result = await runValidators(chain, validBody);
    expect(result.isEmpty()).toBe(true);
  });

  it("fails when title is missing", async () => {
    const body = { ...validBody };
    delete body.title;
    const result = await runValidators(chain, body);
    const paths = result.array().map((e) => e.path);
    expect(paths).toContain("title");
  });

  it("fails when definition is missing", async () => {
    const body = { ...validBody };
    delete body.definition;
    const result = await runValidators(chain, body);
    const paths = result.array().map((e) => e.path);
    expect(paths).toContain("definition");
  });

  it("fails when category is an empty array", async () => {
    const body = { ...validBody, category: [] };
    const result = await runValidators(chain, body);
    const paths = result.array().map((e) => e.path);
    expect(paths).toContain("category");
  });

  it("fails when category is not an array", async () => {
    const body = { ...validBody, category: "linear" };
    const result = await runValidators(chain, body);
    const paths = result.array().map((e) => e.path);
    expect(paths).toContain("category");
  });

  it("fails when type is missing", async () => {
    const body = { ...validBody };
    delete body.type;
    const result = await runValidators(chain, body);
    const paths = result.array().map((e) => e.path);
    expect(paths).toContain("type");
  });

  it("fails when characteristics is missing", async () => {
    const body = { ...validBody };
    delete body.characteristics;
    const result = await runValidators(chain, body);
    const paths = result.array().map((e) => e.path);
    expect(paths).toContain("characteristics");
  });

  it("passes when optional operations field is omitted", async () => {
    const result = await runValidators(chain, validBody);
    expect(result.isEmpty()).toBe(true);
  });

  it("passes when optional operations have all required sub-fields", async () => {
    const body = {
      ...validBody,
      operations: [
        {
          name: "Insert",
          description: "Insert at head",
          complexity: { time: "O(1)", space: "O(1)" },
        },
      ],
    };
    const result = await runValidators(chain, body);
    expect(result.isEmpty()).toBe(true);
  });
});
