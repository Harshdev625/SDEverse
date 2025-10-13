import React, { useEffect, useState, useRef } from "react";
import { Bell, ArrowUpRight, CheckCheck } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchNotifications,
  markAsRead,
  markReadLocally,
  markAllAsRead,
  markAllReadLocally,
} from "../features/notification/notificationSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const NotificationBell = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, loading, error } = useSelector(
    (state) => state.notification
  );
  const { user, token } = useSelector((state) => state.auth);
  const [open, setOpen] = useState(false);
  const isLoggedIn = !!user || !!token;
  const ref = useRef();


  useEffect(() => {
    if (isLoggedIn) {
      dispatch(fetchNotifications());
      const intervalId = setInterval(() => {
        dispatch(fetchNotifications());
      }, 30000);
      return () => clearInterval(intervalId);
    } 
  }, [dispatch, isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (error) {
      toast.error("Failed to load notifications.");
    }
  }, [error]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleClickNotification = (id, link) => {
    dispatch(markReadLocally(id));
    dispatch(markAsRead(id));
    setOpen(false);
    if (link) navigate(link);
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) {
      toast.info("No unread notifications to mark.");
      return;
    }
    try {
      dispatch(markAllReadLocally());
      await dispatch(markAllAsRead()).unwrap();
      toast.success("All notifications marked as read!");
    } catch (err) {
      toast.error("Failed to mark all notifications as read.");

      dispatch(fetchNotifications());
    } finally {
      setOpen(false);
    }
  };

  return isLoggedIn ? (
    
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300 md:w-7 md:h-7" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 px-1.5 py-0.5 text-xs font-bold text-white bg-red-600 rounded-full transform translate-x-1/2 -translate-y-1/2 min-w-[20px] text-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-72 sm:w-80 md:w-96 max-h-96 overflow-y-auto bg-white dark:bg-gray-800 rounded-md shadow-lg z-50 border border-gray-200 dark:border-gray-700 transform origin-top-right animate-fade-in-scale">
          <div className="flex justify-between items-center p-4 text-lg font-semibold text-gray-800 dark:text-gray-200 border-b dark:border-gray-700">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 transition-colors duration-200"
                disabled={loading}
              >
                <CheckCheck className="w-4 h-4" /> Mark All Read
              </button>
            )}
          </div>

          {loading && notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
              No notifications yet.
            </div>
          ) : (
            <ul>
              {notifications.map((note) => (
                <li
                  key={note._id}
                  onClick={() => handleClickNotification(note._id, note.link)}
                  className={`cursor-pointer px-4 py-3 border-b dark:border-gray-700 last:border-b-0 transition-colors duration-200
                    ${
                      note.read
                        ? "bg-gray-50 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                        : "bg-white dark:bg-gray-800 font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span
                      className="text-sm leading-snug"
                      style={{ color: note.read ? "" : note.color }}
                    >
                      {note.message}
                      {note.sender?.username && ` from ${note.sender.username}`}
                    </span>
                    {note.link && (
                      <ArrowUpRight className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    )}
                  </div>
                  {note.preview && (
                    <div className="text-xs mt-1 text-gray-600 dark:text-gray-400 truncate">
                      {note.preview}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(note.createdAt).toLocaleString()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  ): null;
};

export default NotificationBell;
