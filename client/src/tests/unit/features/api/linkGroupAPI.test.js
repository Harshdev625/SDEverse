vi.mock("../../../../utils/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from "../../../../utils/api";
import {
  createGroup,
  getMyGroups,
  getGroup,
  updateGroup,
  deleteGroup,
  addLinkToGroup,
  updateLinkInGroup,
  removeLinkFromGroup,
  shareGroup,
  unshareGroup,
  getGroupsSharedWithMe,
} from "../../../../features/linkGroup/linkGroupAPI";

describe("features/linkGroup/linkGroupAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { ok: true } });
    api.post.mockResolvedValue({ data: { ok: true } });
    api.put.mockResolvedValue({ data: { ok: true } });
    api.delete.mockResolvedValue({ data: { ok: true } });
  });

  it("calls link group endpoints", async () => {
    await createGroup({ name: "g1" });
    expect(api.post).toHaveBeenCalledWith("/link-groups", { name: "g1" });

    await getMyGroups(2, 10, "sheet links");
    expect(api.get).toHaveBeenCalledWith("/link-groups/my?page=2&limit=10&q=sheet%20links");

    await getGroup("g1");
    expect(api.get).toHaveBeenCalledWith("/link-groups/g1");
    await updateGroup("g1", { name: "g2" });
    expect(api.put).toHaveBeenCalledWith("/link-groups/g1", { name: "g2" });
    await deleteGroup("g1");
    expect(api.delete).toHaveBeenCalledWith("/link-groups/g1");

    await addLinkToGroup("g1", { url: "https://x.com" });
    expect(api.post).toHaveBeenCalledWith("/link-groups/g1/links", { url: "https://x.com" });
    await updateLinkInGroup("g1", "l1", { title: "docs" });
    expect(api.put).toHaveBeenCalledWith("/link-groups/g1/links/l1", { title: "docs" });
    await removeLinkFromGroup("g1", "l1");
    expect(api.delete).toHaveBeenCalledWith("/link-groups/g1/links/l1");

    await shareGroup("g1", { username: "alice" });
    expect(api.post).toHaveBeenCalledWith("/link-groups/g1/share", { username: "alice" });
    await unshareGroup("g1", "u1");
    expect(api.delete).toHaveBeenCalledWith("/link-groups/g1/share/u1");

    await getGroupsSharedWithMe(3, 5);
    expect(api.get).toHaveBeenCalledWith("/link-groups/shared?page=3&limit=5");
  });

  it("rethrows errors from link group API", async () => {
    const err = new Error("link group failed");
    api.get.mockRejectedValue(err);
    api.post.mockRejectedValue(err);
    api.put.mockRejectedValue(err);
    api.delete.mockRejectedValue(err);

    await expect(createGroup({})).rejects.toThrow("link group failed");
    await expect(getMyGroups()).rejects.toThrow("link group failed");
    await expect(getGroup("g1")).rejects.toThrow("link group failed");
    await expect(updateGroup("g1", {})).rejects.toThrow("link group failed");
    await expect(deleteGroup("g1")).rejects.toThrow("link group failed");
    await expect(addLinkToGroup("g1", {})).rejects.toThrow("link group failed");
    await expect(updateLinkInGroup("g1", "l1", {})).rejects.toThrow("link group failed");
    await expect(removeLinkFromGroup("g1", "l1")).rejects.toThrow("link group failed");
    await expect(shareGroup("g1", {})).rejects.toThrow("link group failed");
    await expect(unshareGroup("g1", "u1")).rejects.toThrow("link group failed");
    await expect(getGroupsSharedWithMe()).rejects.toThrow("link group failed");
  });
});
