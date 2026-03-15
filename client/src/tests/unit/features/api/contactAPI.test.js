vi.mock("../../../../utils/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from "../../../../utils/api";
import { submitContact, fetchAllContacts, deleteContact } from "../../../../features/contact/contactAPI";

describe("features/contact/contactAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { ok: true } });
    api.post.mockResolvedValue({ data: { ok: true } });
    api.delete.mockResolvedValue({ data: { ok: true } });
  });

  it("calls contact endpoints", async () => {
    await submitContact({ firstName: "John" });
    expect(api.post).toHaveBeenCalledWith("/contact", { firstName: "John" });

    await fetchAllContacts();
    expect(api.get).toHaveBeenCalledWith("/contact");

    await deleteContact("id1");
    expect(api.delete).toHaveBeenCalledWith("/contact/id1");
  });

  it("rethrows API errors", async () => {
    const err = new Error("contact failed");
    api.post.mockRejectedValue(err);
    api.get.mockRejectedValue(err);
    api.delete.mockRejectedValue(err);

    await expect(submitContact({ firstName: "x" })).rejects.toThrow("contact failed");
    await expect(fetchAllContacts()).rejects.toThrow("contact failed");
    await expect(deleteContact("id1")).rejects.toThrow("contact failed");
  });
});
