import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { broadcastNotification, resetBroadcastStatus } from '../../features/notification/notificationSlice';
import { FiSend, FiAlertCircle, FiCheckCircle, FiInfo, FiX } from 'react-icons/fi';

const BroadcastNotification = () => {
  const dispatch = useDispatch();
  const { broadcastStatus, error } = useSelector((state) => state.notification);
  const [formData, setFormData] = useState({
    type: 'platform_request',
    message: '',
    link: '',
    preview: ''
  });
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(broadcastNotification(formData));
  };

  useEffect(() => {
    let timer;
    if (broadcastStatus === 'success' || broadcastStatus === 'error') {
      timer = setTimeout(() => {
        dispatch(resetBroadcastStatus());
      }, 5000);
    }
    return () => clearTimeout(timer);
  }, [broadcastStatus, dispatch]);

  useEffect(() => {
    if (broadcastStatus === 'success') {
      Promise.resolve().then(() => {
        setFormData({
          type: 'platform_request',
          message: '',
          link: '',
          preview: ''
        });
      });
    }
  }, [broadcastStatus]);

  const notificationTypes = [
    { value: 'platform_request', label: 'Platform Announcement', color: 'bg-red-500' },
    { value: 'update', label: 'System Update', color: 'bg-blue-500' },
    { value: 'maintenance', label: 'Maintenance Alert', color: 'bg-amber-500' },
    { value: 'security', label: 'Security Alert', color: 'bg-purple-500' },
    { value: 'feature', label: 'New Feature', color: 'bg-green-500' },
    { value: 'event', label: 'Special Event', color: 'bg-pink-500' },
  ];

  return (
    <div className="max-w-8xl mx-auto p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 border border-gray-200 dark:border-gray-700 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <FiSend className="text-blue-500 dark:text-blue-400 w-6 h-6" />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500">
            Broadcast Center
          </span>
        </h2>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white transition-colors"
        >
          <FiInfo className="w-5 h-5" />
        </button>
      </div>

      {isExpanded && (
        <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl relative">
          <button
            onClick={() => setIsExpanded(false)}
            className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:hover:text-white transition-colors"
          >
            <FiX className="w-4 h-4" />
          </button>
          <h3 className="font-semibold text-blue-500 dark:text-blue-400 mb-2">About Broadcasts</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Broadcast notifications are sent to all platform users. Use them for important announcements,
            system updates, or security alerts. Notifications will appear in users' notification centers
            and may trigger email alerts based on their preferences.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Notification Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {notificationTypes.map((type) => (
                <div key={type.value}>
                  <input
                    type="radio"
                    name="type"
                    id={type.value}
                    value={type.value}
                    checked={formData.type === type.value}
                    onChange={handleChange}
                    className="hidden peer"
                  />
                  <label
                    htmlFor={type.value}
                    className={`block p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.type === type.value
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg shadow-blue-500/10'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className={`w-3 h-3 rounded-full ${type.color}`}></span>
                      <span className="text-sm text-gray-700 dark:text-gray-200">{type.label}</span>
                    </div>
                  </label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Link (optional)
              </label>
              <input
                type="url"
                name="link"
                value={formData.link}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/important-update"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Preview Text (optional)
              </label>
              <input
                type="text"
                name="preview"
                value={formData.preview}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Short preview text for notifications"
                maxLength={100}
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Message *
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Write your important announcement here..."
            required
          />
          <div className="mt-2 flex justify-between text-xs">
            <p className="text-gray-600 dark:text-gray-400">This message will be sent to all platform users</p>
            <span
              className={`${
                formData.message.length > 250 ? 'text-amber-500' : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {formData.message.length}/500
            </span>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className={`w-full py-3.5 px-6 rounded-xl font-bold flex items-center justify-center gap-3 transition-all duration-300 ${
              broadcastStatus === 'loading'
                ? 'bg-blue-700 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40'
            } text-white`}
            disabled={broadcastStatus === 'loading'}
          >
            {broadcastStatus === 'loading' ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Broadcasting...
              </>
            ) : (
              <>
                <FiSend className="text-white w-5 h-5" />
                Broadcast Notification
              </>
            )}
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {broadcastStatus === 'success' && (
            <div className="p-4 flex items-start gap-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-xl animate-fadeIn">
              <FiCheckCircle className="text-green-500 dark:text-green-400 mt-0.5 flex-shrink-0 w-5 h-5" />
              <div className="flex-1">
                <p className="font-semibold text-green-700 dark:text-green-300">Broadcast Successful!</p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Your notification has been sent to all platform users.
                </p>
              </div>
            </div>
          )}

          {broadcastStatus === 'error' && error && (
            <div className="p-4 flex items-start gap-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl animate-fadeIn">
              <FiAlertCircle className="text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0 w-5 h-5" />
              <div className="flex-1">
                <p className="font-semibold text-red-700 dark:text-red-300">Broadcast Failed</p>
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {error.message || 'Error sending notification. Please try again.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};

export default BroadcastNotification;
