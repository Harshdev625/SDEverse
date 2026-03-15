vi.mock("../../../../utils/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from "../../../../utils/api";
import {
  createProposal,
  getAllProposals,
  getProposalBySlug,
  updateProposal,
  reviewProposal,
  deleteProposal,
} from "../../../../features/dataStructureProposal/dataStructureProposalAPI";

describe("features/dataStructureProposal/dataStructureProposalAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { ok: true } });
    api.post.mockResolvedValue({ data: { ok: true } });
    api.put.mockResolvedValue({ data: { ok: true } });
    api.patch.mockResolvedValue({ data: { ok: true } });
    api.delete.mockResolvedValue({ data: { ok: true } });
  });

  it("calls proposal endpoints correctly", async () => {
    await createProposal({ title: "P1" });
    expect(api.post).toHaveBeenCalledWith("/data-structure-proposals/newproposal", { title: "P1" });

    await getAllProposals({ status: "pending" });
    expect(api.get).toHaveBeenCalledWith("/data-structure-proposals", { params: { status: "pending" } });

    await getProposalBySlug("p1");
    expect(api.get).toHaveBeenCalledWith("/data-structure-proposals/slug/p1");

    await updateProposal("p1", { title: "P2" });
    expect(api.patch).toHaveBeenCalledWith("/data-structure-proposals/p1", { title: "P2" });

    await reviewProposal("p1", { status: "approved" });
    expect(api.put).toHaveBeenCalledWith("/data-structure-proposals/review/p1", { status: "approved" });

    await deleteProposal("p1");
    expect(api.delete).toHaveBeenCalledWith("/data-structure-proposals/p1");
  });
});
