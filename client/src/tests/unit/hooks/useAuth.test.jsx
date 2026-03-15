// @vitest-environment jsdom

import React from "react";
import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";

const { navigateMock, toastInfoMock, toastErrorMock } = vi.hoisted(() => ({
  navigateMock: vi.fn(),
  toastInfoMock: vi.fn(),
  toastErrorMock: vi.fn(),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("react-toastify", () => ({
  toast: {
    info: toastInfoMock,
    error: toastErrorMock,
  },
}));

import { useAuth } from "../../../hooks/useAuth";

function makeStore(authState) {
  return configureStore({
    reducer: {
      auth: (state = authState) => state,
    },
  });
}

function makeWrapper(authState) {
  const store = makeStore(authState);
  return function Wrapper({ children }) {
    return <Provider store={store}>{children}</Provider>;
  };
}

describe("hooks/useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("redirects unauthenticated users in requireAuth", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: makeWrapper({ user: null, isAuthenticated: false }),
    });

    const callback = vi.fn();
    const allowed = result.current.requireAuth(callback);

    expect(allowed).toBe(false);
    expect(callback).not.toHaveBeenCalled();
    expect(toastInfoMock).toHaveBeenCalledWith("Please log in to continue");
    expect(navigateMock).toHaveBeenCalledWith("/login");
  });

  it("allows authenticated users and runs callback", () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: makeWrapper({ user: { _id: "u1", role: "user" }, isAuthenticated: true }),
    });

    const callback = vi.fn();
    const allowed = result.current.requireAuth(callback);

    expect(allowed).toBe(true);
    expect(callback).toHaveBeenCalledOnce();
  });

  it("enforces admin access and exposes isAdmin/isOwner", () => {
    const { result: nonAdmin } = renderHook(() => useAuth(), {
      wrapper: makeWrapper({ user: { _id: "u1", role: "user", id: "legacy-1" }, isAuthenticated: true }),
    });

    expect(nonAdmin.current.isAdmin).toBe(false);
    expect(nonAdmin.current.isOwner("u1")).toBe(true);
    expect(nonAdmin.current.isOwner("legacy-1")).toBe(true);
    expect(nonAdmin.current.isOwner("other")).toBe(false);

    const callback = vi.fn();
    const allowed = nonAdmin.current.requireAdmin(callback);
    expect(allowed).toBe(false);
    expect(callback).not.toHaveBeenCalled();
    expect(toastErrorMock).toHaveBeenCalledWith("Admin access required");
    expect(navigateMock).toHaveBeenCalledWith("/");

    const { result: admin } = renderHook(() => useAuth(), {
      wrapper: makeWrapper({ user: { _id: "a1", role: "admin" }, isAuthenticated: true }),
    });
    const adminCallback = vi.fn();
    expect(admin.current.requireAdmin(adminCallback)).toBe(true);
    expect(admin.current.isAdmin).toBe(true);
    expect(adminCallback).toHaveBeenCalledOnce();
  });
});
