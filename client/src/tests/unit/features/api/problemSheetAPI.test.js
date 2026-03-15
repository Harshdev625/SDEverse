vi.mock("../../../../utils/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from "../../../../utils/api";
import {
  getAllSheets,
  getAllSheetsAdmin,
  getSheetById,
  getSheetProblems,
  getSheetMetrics,
  markProblemComplete,
  getHintsSolution,
  createProblemSheet,
  updateProblemSheet,
  deleteProblemSheet,
  createProblem,
  updateProblem,
  deleteProblem,
} from "../../../../features/problemSheet/problemSheetAPI";

describe("features/problemSheet/problemSheetAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { ok: true } });
    api.post.mockResolvedValue({ data: { ok: true } });
    api.put.mockResolvedValue({ data: { ok: true } });
    api.delete.mockResolvedValue({ data: { ok: true } });
  });

  it("calls problem sheet endpoints", async () => {
    await getAllSheets();
    expect(api.get).toHaveBeenCalledWith("/problem-sheets");
    await getAllSheetsAdmin();
    expect(api.get).toHaveBeenCalledWith("/problem-sheets/admin/all");
    await getSheetById("s1");
    expect(api.get).toHaveBeenCalledWith("/problem-sheets/s1");

    await getSheetProblems("s1", { page: 2 });
    expect(api.get).toHaveBeenCalledWith("/problem-sheets/s1/problems", { params: { page: 2 } });
    await getSheetMetrics("s1", { range: "30d" });
    expect(api.get).toHaveBeenCalledWith("/problem-sheets/s1/metrics", { params: { range: "30d" } });

    await markProblemComplete("p1", true);
    expect(api.post).toHaveBeenCalledWith("/problem-sheets/problems/p1/complete", { completed: true });
    await getHintsSolution("p1");
    expect(api.get).toHaveBeenCalledWith("/problem-sheets/problems/p1/hints-solution");

    await createProblemSheet({ title: "Blind 75" });
    expect(api.post).toHaveBeenCalledWith("/problem-sheets", { title: "Blind 75" });
    await updateProblemSheet("blind-75", { title: "Updated" });
    expect(api.put).toHaveBeenCalledWith("/problem-sheets/blind-75", { title: "Updated" });
    await deleteProblemSheet("blind-75");
    expect(api.delete).toHaveBeenCalledWith("/problem-sheets/blind-75");

    await createProblem("s1", { title: "Two Sum" });
    expect(api.post).toHaveBeenCalledWith("/problem-sheets/s1/problems", { title: "Two Sum" });
    await updateProblem("p1", { title: "Two Sum 2" });
    expect(api.put).toHaveBeenCalledWith("/problem-sheets/problems/p1", { title: "Two Sum 2" });
    await deleteProblem("p1");
    expect(api.delete).toHaveBeenCalledWith("/problem-sheets/problems/p1");
  });
});
