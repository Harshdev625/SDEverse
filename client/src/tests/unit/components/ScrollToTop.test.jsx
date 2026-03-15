// @vitest-environment jsdom

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ScrollToTop from "../../../components/ScrollToTop";

describe("components/ScrollToTop", () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
    Object.defineProperty(window, "pageYOffset", {
      writable: true,
      configurable: true,
      value: 0,
    });
  });

  it("stays hidden near the top of the page", () => {
    render(<ScrollToTop />);
    expect(screen.queryByRole("button", { name: "Scroll to top" })).toBeNull();
  });

  it("appears after scrolling and scrolls back to top on click", () => {
    render(<ScrollToTop />);

    window.pageYOffset = 500;
    fireEvent.scroll(window);

    const button = screen.getByRole("button", { name: "Scroll to top" });
    expect(button).toBeTruthy();

    fireEvent.click(button);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: "smooth" });
  });
});
