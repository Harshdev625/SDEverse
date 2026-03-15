
vi.mock("express-async-handler", () => (fn) => fn);
vi.mock("../../../models/notification.model");
vi.mock("../../../models/user.model");

const Notification = require("../../../models/notification.model");
const User = require("../../../models/user.model");
const {
  getUserNotifications,
  markNotificationRead,
  broadcastNotification,
  markAllNotificationsRead,
} = require("../../../controllers/notification.controller");

function makeRes() {
  const json = vi.fn();
  const res = { status: vi.fn(() => res), json };
  return res;
}

describe("notification.controller – getUserNotifications", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns formatted notification list", async () => {
    const fakeNotifs = [
      {
        _id: "n1",
        recipient: "u1",
        sender: { _id: "s1", username: "bob" },
        type: "mention",
        read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        message: "Bob mentioned you",
        preview: null,
        link: "/post/1",
      },
    ];
    Notification.find = vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      populate: vi.fn().mockResolvedValue(fakeNotifs),
    });

    const req = { user: { _id: "u1" } };
    const res = makeRes();
    await getUserNotifications(req, res, vi.fn());

    const result = res.json.mock.calls[0][0];
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      _id: "n1",
      type: "mention",
      color: "blue",
      sender: expect.objectContaining({ username: "bob" }),
    });
  });

  it("uses 'white' color for unknown notification types", async () => {
    const fakeNotifs = [
      {
        _id: "n2",
        recipient: "u1",
        sender: null,
        type: "unknown",
        read: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
    Notification.find = vi.fn().mockReturnValue({
      sort: vi.fn().mockReturnThis(),
      populate: vi.fn().mockResolvedValue(fakeNotifs),
    });

    const req = { user: { _id: "u1" } };
    const res = makeRes();
    await getUserNotifications(req, res, vi.fn());

    const result = res.json.mock.calls[0][0];
    expect(result[0].color).toBe("white");
    expect(result[0].sender.username).toBe("Someone");
  });
});

describe("notification.controller – markNotificationRead", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sets 404 when notification not found", async () => {
    Notification.findById = vi.fn().mockResolvedValue(null);
    const req = { params: { id: "n1" }, user: { _id: "u1" } };
    const res = makeRes();
    await markNotificationRead(req, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(404);
  });

  it("sets 403 when notification belongs to another user", async () => {
    Notification.findById = vi.fn().mockResolvedValue({
      _id: "n1",
      recipient: { toString: () => "other-user" },
    });
    const req = { params: { id: "n1" }, user: { _id: { toString: () => "u1" } } };
    const res = makeRes();
    await markNotificationRead(req, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it("marks notification as read and returns success", async () => {
    const fakeNotif = {
      _id: "n1",
      recipient: { toString: () => "u1" },
      read: false,
      save: vi.fn().mockResolvedValue(true),
    };
    Notification.findById = vi.fn().mockResolvedValue(fakeNotif);
    const req = { params: { id: "n1" }, user: { _id: { toString: () => "u1" } } };
    const res = makeRes();
    await markNotificationRead(req, res, vi.fn());
    expect(fakeNotif.read).toBe(true);
    expect(fakeNotif.save).toHaveBeenCalledOnce();
    expect(res.json).toHaveBeenCalledWith({ message: "Notification marked as read" });
  });
});

describe("notification.controller – broadcastNotification", () => {
  beforeEach(() => vi.clearAllMocks());

  it("sets 400 when type or message is missing", async () => {
    const req = { body: {}, user: { _id: "admin1" } };
    const res = makeRes();
    await broadcastNotification(req, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(400);
  });

  it("broadcasts to all users and returns 201", async () => {
    User.find = vi.fn().mockResolvedValue([{ _id: "u1" }, { _id: "u2" }]);
    Notification.insertMany = vi.fn().mockResolvedValue([]);

    const req = {
      body: { type: "mention", message: "System update" },
      user: { _id: "admin1" },
    };
    const res = makeRes();
    await broadcastNotification(req, res, vi.fn());

    expect(Notification.insertMany).toHaveBeenCalledOnce();
    const [inserts] = Notification.insertMany.mock.calls[0];
    expect(inserts).toHaveLength(2);
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "Broadcast sent to 2 users." })
    );
  });
});

describe("notification.controller – markAllNotificationsRead", () => {
  beforeEach(() => vi.clearAllMocks());

  it("returns message when no unread notifications", async () => {
    Notification.updateMany = vi.fn().mockResolvedValue({ modifiedCount: 0 });
    const req = { user: { _id: "u1" } };
    const res = makeRes();
    await markAllNotificationsRead(req, res, vi.fn());
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: "No unread notifications to mark as read." })
    );
  });

  it("marks all unread notifications and returns count", async () => {
    Notification.updateMany = vi.fn().mockResolvedValue({ modifiedCount: 5 });
    const req = { user: { _id: "u1" } };
    const res = makeRes();
    await markAllNotificationsRead(req, res, vi.fn());
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining("5") })
    );
  });
});
