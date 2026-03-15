import api from "./api";

describe("api client", () => {
  beforeEach(() => {
    const storage = {};
    global.localStorage = {
      getItem: vi.fn((key) => storage[key] ?? null),
      setItem: vi.fn((key, value) => {
        storage[key] = String(value);
      }),
      clear: vi.fn(() => {
        Object.keys(storage).forEach((key) => delete storage[key]);
      }),
    };
  });

  afterEach(() => {
    localStorage.clear();
    delete global.localStorage;
  });

  it("keeps base URL configured", () => {
    expect(api.defaults.baseURL).toBeTruthy();
    expect(typeof api.defaults.baseURL).toBe("string");
  });

  it("adds Authorization header when token exists", async () => {
    localStorage.setItem("token", "abc123");

    const handler = api.interceptors.request.handlers[0].fulfilled;
    const config = await handler({ headers: {} });

    expect(config.headers.Authorization).toBe("Bearer abc123");
  });

  it("does not add Authorization header when token missing", async () => {
    const handler = api.interceptors.request.handlers[0].fulfilled;
    const config = await handler({ headers: {} });

    expect(config.headers.Authorization).toBeUndefined();
  });
});
