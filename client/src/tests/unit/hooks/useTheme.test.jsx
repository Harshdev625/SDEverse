// @vitest-environment jsdom

import React from "react";
import { act, renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "../../../features/theme/themeSlice";
import { useTheme } from "../../../hooks/useTheme";

function makeWrapper(preloadedState = { theme: { mode: "light" } }) {
  const store = configureStore({
    reducer: { theme: themeReducer },
    preloadedState,
  });

  return function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe("hooks/useTheme", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
    window.matchMedia = vi.fn().mockReturnValue({ matches: false });
  });

  it("exposes light state and toggles to dark", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: makeWrapper(),
    });

    expect(result.current.mode).toBe("light");
    expect(result.current.isLight).toBe(true);
    expect(result.current.isDark).toBe(false);

    act(() => {
      result.current.toggleTheme();
    });

    expect(localStorage.getItem("theme")).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("sets an explicit theme mode", () => {
    const { result } = renderHook(() => useTheme(), {
      wrapper: makeWrapper({ theme: { mode: "dark" } }),
    });

    act(() => {
      result.current.setThemeMode("light");
    });

    expect(localStorage.getItem("theme")).toBe("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("hydrates from saved theme preference", () => {
    localStorage.setItem("theme", "dark");

    const { result } = renderHook(() => useTheme(), {
      wrapper: makeWrapper({ theme: { mode: "light" } }),
    });

    expect(result.current.mode).toBe("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
