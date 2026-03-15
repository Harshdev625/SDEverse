vi.mock("../../../../utils/api", () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

import api from "../../../../utils/api";
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  sendBroadcastNotification,
} from "../../../../features/notification/notificationAPI";

describe("features/notification/notificationAPI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: [] });
    api.put.mockResolvedValue({ data: { ok: true } });
    api.post.mockResolvedValue({ data: { ok: true } });
  });

  it("calls notification endpoints", async () => {
    await getNotifications();
    expect(api.get).toHaveBeenCalledWith("/notifications");

    await markNotificationAsRead("n1");
    expect(api.put).toHaveBeenCalledWith("/notifications/n1/read");

    await markAllNotificationsAsRead();
    expect(api.put).toHaveBeenCalledWith("/notifications/read-all");

    await sendBroadcastNotification({ message: "hello" });
    expect(api.post).toHaveBeenCalledWith("/notifications/admin/broadcast", { message: "hello" });
  });

  it("rethrows errors from notification endpoints", async () => {
    const err = new Error("notification failed");
    api.get.mockRejectedValue(err);
    api.put.mockRejectedValue(err);
    api.post.mockRejectedValue(err);

    await expect(getNotifications()).rejects.toThrow("notification failed");
    await expect(markNotificationAsRead("n1")).rejects.toThrow("notification failed");
    await expect(markAllNotificationsAsRead()).rejects.toThrow("notification failed");
    await expect(sendBroadcastNotification({ message: "x" })).rejects.toThrow("notification failed");
  });
});
