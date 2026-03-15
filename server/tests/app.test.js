const request = require("supertest");
const app = require("../app");

describe("Server health and error routes", () => {
  it("returns 200 and health payload on /health", async () => {
    const response = await request(app).get("/health");

    expect(response.statusCode).toBe(200);
    expect(response.body.status).toBe("OK");
    expect(typeof response.body.timestamp).toBe("string");
  });

  it("returns 404 for unknown route", async () => {
    const response = await request(app).get("/unknown-route");

    expect(response.statusCode).toBe(404);
    expect(response.body.message).toContain("Not Found");
  });
});