// @vitest-environment jsdom

import reducer, { toggleTheme, setTheme } from "../../../../features/theme/themeSlice";

describe("features/theme/themeSlice", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    document.head.innerHTML = "";
  });

  it("toggles between light and dark and persists state", () => {
    const state = reducer({ mode: "light" }, toggleTheme());

    expect(state.mode).toBe("dark");
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.getElementById("scrollbar-theme-style")).toBeTruthy();
  });

  it("sets an explicit theme and removes dark class for light mode", () => {
    document.documentElement.classList.add("dark");

    const state = reducer({ mode: "dark" }, setTheme("light"));

    expect(state.mode).toBe("light");
    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });
});
