vi.mock("../../../../utils/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from "../../../../utils/api";
import { submitFeedback, fetchAllFeedback } from "../../../../features/feedback/feedbackAPI";

describe("features/feedback/feedbackAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { items: [] } });
    api.post.mockResolvedValue({ data: { ok: true } });
  });

  it("calls feedback endpoints", async () => {
    await submitFeedback({ type: "bug", message: "Issue" });
    expect(api.post).toHaveBeenCalledWith("/feedback", { type: "bug", message: "Issue" });

    await fetchAllFeedback();
    expect(api.get).toHaveBeenCalledWith("/feedback/feedback");
  });

  it("rethrows errors from feedback API", async () => {
    const err = new Error("feedback failed");
    api.post.mockRejectedValue(err);
    api.get.mockRejectedValue(err);

    await expect(submitFeedback({ message: "x" })).rejects.toThrow("feedback failed");
    await expect(fetchAllFeedback()).rejects.toThrow("feedback failed");
  });
});
