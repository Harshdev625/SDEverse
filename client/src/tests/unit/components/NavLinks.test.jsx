// @vitest-environment jsdom

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter } from "react-router-dom";
import NavLinks from "../../../components/NavLinks";

function renderWithUser(user, onClick = vi.fn()) {
  const store = configureStore({
    reducer: {
      auth: (state = { user }) => state,
    },
  });

  render(
    <Provider store={store}>
      <MemoryRouter>
        <NavLinks onClick={onClick} />
      </MemoryRouter>
    </Provider>
  );

  return { onClick };
}

describe("components/NavLinks", () => {
  it("shows guest links when no user exists", () => {
    renderWithUser(null);
    expect(screen.getByText("Home")).toBeTruthy();
    expect(screen.getByText("Algorithms")).toBeTruthy();
    expect(screen.getByText("Blogs")).toBeTruthy();
    expect(screen.getByText("Login")).toBeTruthy();
    expect(screen.getByText("Register")).toBeTruthy();
  });

  it("shows admin links for admins", () => {
    renderWithUser({ role: "admin" });
    expect(screen.getByText("Manage Users")).toBeTruthy();
    expect(screen.getByText("Manage Algorithms")).toBeTruthy();
    expect(screen.getByText("Review Contributions")).toBeTruthy();
  });

  it("shows member links and triggers onClick", () => {
    const { onClick } = renderWithUser({ role: "user" });
    const profileLink = screen.getByText("Profile");

    expect(profileLink).toBeTruthy();
    expect(screen.getByText("My Contributions")).toBeTruthy();

    fireEvent.click(profileLink);
    expect(onClick).toHaveBeenCalled();
  });
});
