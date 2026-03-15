const KeepAlive = require("../../../utils/keepAlive");

describe("KeepAlive", () => {
  it("is disabled outside production by default", () => {
    const oldNodeEnv = process.env.NODE_ENV;
    delete process.env.NODE_ENV;

    const keepAlive = new KeepAlive();

    expect(keepAlive.enabled).toBe(false);
    expect(keepAlive.serverUrl).toBe("http://localhost:5000");

    process.env.NODE_ENV = oldNodeEnv;
  });

  it("uses SERVER_URL when provided", () => {
    const oldServerUrl = process.env.SERVER_URL;
    const oldNodeEnv = process.env.NODE_ENV;

    process.env.SERVER_URL = "https://api.sdeverse.com";
    process.env.NODE_ENV = "production";

    const keepAlive = new KeepAlive();

    expect(keepAlive.enabled).toBe(true);
    expect(keepAlive.serverUrl).toBe("https://api.sdeverse.com");

    process.env.SERVER_URL = oldServerUrl;
    process.env.NODE_ENV = oldNodeEnv;
  });

  it("stop safely handles missing task", () => {
    const keepAlive = new KeepAlive();
    expect(() => keepAlive.stop()).not.toThrow();
  });

  it("stop delegates to task.stop when task exists", () => {
    const keepAlive = new KeepAlive();
    const stop = vi.fn();
    keepAlive.task = { stop };

    keepAlive.stop();

    expect(stop).toHaveBeenCalledTimes(1);
  });
});
