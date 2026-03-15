vi.mock("../../../../utils/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from "../../../../utils/api";
import { getTopContributors, getTopFeedback } from "../../../../features/community/communityAPI";

describe("features/community/communityAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns top contributors and feedback data", async () => {
    api.get.mockResolvedValueOnce({ data: [{ user: "a" }] }).mockResolvedValueOnce({ data: [{ user: "b" }] });

    const contributors = await getTopContributors();
    expect(api.get).toHaveBeenCalledWith("/community/top-contributors");
    expect(contributors).toEqual([{ user: "a" }]);

    const feedback = await getTopFeedback();
    expect(api.get).toHaveBeenCalledWith("/community/top-feedback");
    expect(feedback).toEqual([{ user: "b" }]);
  });

  it("throws normalized error when request fails", async () => {
    api.get.mockRejectedValue({ response: { data: { message: "boom" } } });
    await expect(getTopContributors()).rejects.toThrow("boom");
  });
});
