// @vitest-environment jsdom

import * as hooks from "../../../hooks";

describe("hooks/index", () => {
  it("re-exports shared hooks", () => {
    expect(typeof hooks.useAuth).toBe("function");
    expect(typeof hooks.usePagination).toBe("function");
    expect(typeof hooks.useTheme).toBe("function");
  });
});
