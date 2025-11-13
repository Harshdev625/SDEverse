import { useEffect, useState } from "react";

function RoleEditModal({ isOpen, onClose, onConfirm, user }) {
  const [newRole, setNewRole] = useState(user?.role || "user");

  useEffect(() => {
    if (user?.role && user.role !== newRole) {
      setNewRole(user.role);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  if (!isOpen || !user) return null;

  const isAdmin = newRole === "admin";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl text-white border border-gray-700">
        <h2 className="text-2xl font-semibold mb-4">Change User Role</h2>
        <p className="mb-6 text-gray-300">
          Change role for{" "}
          <strong className="text-white">{user.fullName || "Unnamed User"}</strong>
        </p>

        <div className="flex items-center justify-between mb-6">
          <span className="text-gray-400 font-medium">User</span>
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input
              type="checkbox"
              className="sr-only peer"
              checked={isAdmin}
              onChange={() => setNewRole(isAdmin ? "user" : "admin")}
            />
            <div className="w-14 h-8 bg-gray-600 rounded-full peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-500 peer-checked:bg-indigo-600 transition-all duration-200" />
            <span className="absolute left-1 top-1 w-6 h-6 bg-white rounded-full shadow-sm transition-transform duration-200 peer-checked:translate-x-6" />
          </label>
          <span className="text-gray-400 font-medium">Admin</span>
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(newRole)}
            disabled={newRole === user.role}
            className={`px-4 py-2 rounded-lg font-semibold transition focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
              newRole === user.role
                ? "bg-gray-600 cursor-not-allowed text-gray-300"
                : "bg-indigo-600 hover:bg-indigo-700 text-white"
            }`}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default RoleEditModal;
