const cron = require("node-cron");
const axios = require("axios");
const KeepAlive = require("../../../utils/keepAlive");

describe("KeepAlive", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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

  it("does not schedule task when disabled", () => {
    process.env.NODE_ENV = "development";
    const cronSpy = vi.spyOn(cron, "schedule");
    const keepAlive = new KeepAlive();

    keepAlive.start();

    expect(cronSpy).not.toHaveBeenCalled();
  });

  it("starts scheduled ping in production and hits health endpoint", async () => {
    process.env.NODE_ENV = "production";
    process.env.SERVER_URL = "https://api.sdeverse.com";
    process.env.KEEP_ALIVE_INTERVAL = "*/5 * * * *";
    const taskStopMock = vi.fn();
    const cronSpy = vi.spyOn(cron, "schedule").mockReturnValue({ stop: taskStopMock });
    const axiosSpy = vi.spyOn(axios, "get").mockResolvedValue({ status: 200 });
    const keepAlive = new KeepAlive();

    keepAlive.start();

    expect(cronSpy).toHaveBeenCalledWith("*/5 * * * *", expect.any(Function));
    expect(keepAlive.task).toEqual({ stop: taskStopMock });

    const job = cronSpy.mock.calls[0][1];
    await job();
    expect(axiosSpy).toHaveBeenCalledWith("https://api.sdeverse.com/health");
  });

  it("swallows ping failures inside scheduled task", async () => {
    process.env.NODE_ENV = "production";
    delete process.env.SERVER_URL;
    delete process.env.KEEP_ALIVE_INTERVAL;
    const cronSpy = vi.spyOn(cron, "schedule").mockReturnValue({ stop: vi.fn() });
    const axiosSpy = vi.spyOn(axios, "get").mockRejectedValue(new Error("network down"));
    const keepAlive = new KeepAlive();

    keepAlive.start();
    const job = cronSpy.mock.calls[0][1];

    await expect(job()).resolves.toBeUndefined();
    expect(axiosSpy).toHaveBeenCalledWith("http://localhost:5000/health");
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
