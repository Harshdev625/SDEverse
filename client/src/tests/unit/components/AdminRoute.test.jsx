// @vitest-environment jsdom

import React from "react";
import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import AdminRoute from "../../../components/AdminRoute";

function renderWithAuth(authState) {
  const store = configureStore({
    reducer: {
      auth: (state = authState) => state,
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <div>Admin Content</div>
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    </Provider>
  );
}

describe("components/AdminRoute", () => {
  it("redirects unauthenticated users", () => {
    renderWithAuth({ token: null, user: null });
    expect(screen.getByText("Home Page")).toBeTruthy();
  });

  it("redirects non-admin users", () => {
    renderWithAuth({ token: "token", user: { role: "user" } });
    expect(screen.getByText("Home Page")).toBeTruthy();
  });

  it("renders children for admins", () => {
    renderWithAuth({ token: "token", user: { role: "admin" } });
    expect(screen.getByText("Admin Content")).toBeTruthy();
  });
});
