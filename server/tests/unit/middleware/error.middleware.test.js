const { errorHandler, notFound } = require("../../../middleware/error.middleware");

describe("error middleware", () => {
  it("notFound sets 404 and forwards error", () => {
    const req = { originalUrl: "/missing" };
    const res = {
      status: vi.fn(),
    };
    const next = vi.fn();

    notFound(req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(next).toHaveBeenCalledTimes(1);
    const passedError = next.mock.calls[0][0];
    expect(passedError).toBeInstanceOf(Error);
    expect(passedError.message).toContain("Not Found - /missing");
  });

  it("errorHandler uses existing status and returns stack in non-production", () => {
    const oldEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "development";

    const err = new Error("boom");
    const req = {};
    const res = {
      statusCode: 404,
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    errorHandler(err, req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "boom",
      })
    );
    expect(res.json.mock.calls[0][0].stack).toBeTruthy();

    process.env.NODE_ENV = oldEnv;
  });

  it("errorHandler defaults status to 500 and hides stack in production", () => {
    const oldEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    const err = new Error("prod-fail");
    const req = {};
    const res = {
      statusCode: 200,
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    errorHandler(err, req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "prod-fail",
      stack: null,
    });

    process.env.NODE_ENV = oldEnv;
  });
});
