// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { usePagination } from "../../../hooks/usePagination";

describe("hooks/usePagination", () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  it("initializes with defaults", () => {
    const { result } = renderHook(() => usePagination());

    expect(result.current.page).toBe(1);
    expect(result.current.limit).toBe(12);
    expect(result.current.search).toBe("");
  });

  it("supports custom initial values and page changes", () => {
    const { result } = renderHook(() => usePagination(3, 24));

    expect(result.current.page).toBe(3);
    expect(result.current.limit).toBe(24);

    act(() => {
      result.current.setPage(5);
    });

    expect(result.current.page).toBe(5);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });

  it("resets page when search changes and can reset fully", () => {
    const { result } = renderHook(() => usePagination(2, 10));

    act(() => {
      result.current.setPage(4);
      result.current.setSearch("graphs");
    });

    expect(result.current.page).toBe(1);
    expect(result.current.search).toBe("graphs");

    act(() => {
      result.current.resetPagination();
    });

    expect(result.current.page).toBe(2);
    expect(result.current.search).toBe("");
  });
});
