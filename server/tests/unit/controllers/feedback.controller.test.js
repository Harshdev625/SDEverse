
vi.mock("express-async-handler", () => (fn) => fn);
vi.mock("../../../models/feedback.model");
vi.mock("../../../models/notification.model");
vi.mock("../../../models/user.model");

const Feedback = require("../../../models/feedback.model");
const Notification = require("../../../models/notification.model");
const User = require("../../../models/user.model");
const { submitFeedback, getAllFeedback } = require("../../../controllers/feedback.controller");

function makeRes() {
  const json = vi.fn();
  const res = { status: vi.fn(() => res), json };
  return res;
}

describe("feedback.controller – submitFeedback", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sets 400 when required fields are missing", async () => {
    const req = { user: { _id: "u1" }, body: {} };
    const res = makeRes();
    await submitFeedback(req, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("creates feedback and notifies admins", async () => {
    const fakeFeedback = { _id: "f1", type: "bug", title: "Crash on login" };
    Feedback.create = vi.fn().mockResolvedValue(fakeFeedback);
    User.find = vi.fn().mockResolvedValue([{ _id: "admin1" }]);
    Notification.insertMany = vi.fn().mockResolvedValue([]);

    const req = {
      user: { _id: "u1" },
      body: {
        type: "bug",
        title: "Crash on login",
        description: "App crashes when I click login",
      },
    };
    const res = makeRes();
    await submitFeedback(req, res, vi.fn());

    expect(Feedback.create).toHaveBeenCalledOnce();
    expect(Notification.insertMany).toHaveBeenCalledOnce();
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Feedback submitted", feedback: fakeFeedback })
    );
  });

  it("notifies multiple admins", async () => {
    const fakeFeedback = { _id: "f2", type: "feature", title: "Dark mode" };
    Feedback.create = vi.fn().mockResolvedValue(fakeFeedback);
    User.find = vi.fn().mockResolvedValue([{ _id: "a1" }, { _id: "a2" }, { _id: "a3" }]);
    Notification.insertMany = vi.fn().mockResolvedValue([]);

    const req = {
      user: { _id: "u1" },
      body: { type: "feature", title: "Dark mode", description: "Add a dark mode option" },
    };
    const res = makeRes();
    await submitFeedback(req, res, vi.fn());
    const [notifArr] = Notification.insertMany.mock.calls[0];
    expect(notifArr).toHaveLength(3);
  });
});

describe("feedback.controller – getAllFeedback", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns paginated feedback list", async () => {
    const fakeList = [{ _id: "f1" }, { _id: "f2" }];
    Feedback.countDocuments = vi.fn().mockResolvedValue(2);
    Feedback.find = vi.fn().mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue(fakeList),
    });

    const req = { query: {} };
    const res = makeRes();
    await getAllFeedback(req, res, vi.fn());

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        feedbacks: fakeList,
        pagination: expect.objectContaining({ currentPage: 1 }),
      })
    );
  });

  it("applies status/type/severity filters from query", async () => {
    Feedback.countDocuments = vi.fn().mockResolvedValue(0);
    Feedback.find = vi.fn().mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    });

    const req = { query: { status: "open", type: "bug", severity: "high", page: "2", limit: "5" } };
    const res = makeRes();
    await getAllFeedback(req, res, vi.fn());

    const [calledQuery] = Feedback.countDocuments.mock.calls[0];
    expect(calledQuery).toMatchObject({ status: "open", type: "bug", severity: "high" });
  });

  it("applies search filter when search query is provided", async () => {
    Feedback.countDocuments = vi.fn().mockResolvedValue(0);
    Feedback.find = vi.fn().mockReturnValue({
      populate: vi.fn().mockReturnThis(),
      sort: vi.fn().mockReturnThis(),
      skip: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    });

    const req = { query: { search: "crash" } };
    const res = makeRes();
    await getAllFeedback(req, res, vi.fn());

    const [calledQuery] = Feedback.countDocuments.mock.calls[0];
    expect(calledQuery.$or).toBeDefined();
  });
});
