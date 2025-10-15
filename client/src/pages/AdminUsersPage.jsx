import { useEffect, useState, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllUsers,
  removeUser,
  changeUserRole,
} from "../features/user/userSlice";
import { FaEye, FaTrash, FaUserEdit } from "react-icons/fa";
import { toast } from "react-toastify";
import ProfileForm from "./ProfileForm";
import Pagination from "./Pagination";
import RoleEditModal from "./RoleEditModal";

function AdminUsersPage() {
  const dispatch = useDispatch();
  const { users = [], totalPages = 1 } = useSelector((state) => state.user);
  const themeMode = useSelector((state) => state.theme.mode);

  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  const [selectedUserForRoleEdit, setSelectedUserForRoleEdit] = useState(null);

  useEffect(() => {
    dispatch(
      getAllUsers({
        search: searchQuery,
        role: roleFilter || undefined,
        page: currentPage,
        limit: 10,
      })
    );
  }, [dispatch, searchQuery, roleFilter, currentPage]);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      await dispatch(removeUser(id)).unwrap();
      toast.success("User deleted successfully.");
    } catch (err) {
      toast.error(`Failed to delete user: ${err.message || err}`);
    }
  };

  const handleExpand = (id) => {
    setExpandedUserId((prev) => (prev === id ? null : id));
  };

  const handleRoleChangeConfirm = async (newRole) => {
    const id = selectedUserForRoleEdit?._id;
    try {
      await dispatch(changeUserRole({ id, role: newRole })).unwrap();
      toast.success("User role updated.");
      setSelectedUserForRoleEdit(null);
    } catch (err) {
      toast.error(`Failed to update role: ${err.message || err}`);
    }
  };

  return (
    <div className={`max-w-7xl mx-auto px-4 py-10 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
      <h1 className={`text-4xl font-bold text-center mb-8 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>User Management</h1>

      {/* Search & Filters */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearchQuery(input);
          setCurrentPage(1);
        }}
        className="flex flex-wrap md:flex-nowrap items-center gap-3 mb-6"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search by name, email, or username"
          className={`flex-1 min-w-[200px] px-4 py-2 rounded border focus:ring-2 focus:border-gray-400 focus:ring-gray-300 ${
            themeMode === 'dark' 
              ? 'bg-gray-800 border-gray-600 text-white focus:ring-gray-500' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className={`w-full md:w-48 px-4 py-2 rounded border ${
            themeMode === 'dark' 
              ? 'bg-gray-800 border-gray-600 text-white' 
              : 'bg-white border-gray-300 text-gray-900'
          }`}
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="user">User</option>
        </select>
        <button
          type="submit"
          className="bg-indigo-600 px-6 py-2 rounded font-semibold text-white hover:bg-indigo-700"
        >
          Search
        </button>
      </form>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className={themeMode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}>
            <tr>
              <th className={`px-4 py-3 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>Name</th>
              <th className={`px-4 py-3 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>Username</th>
              <th className={`px-4 py-3 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>Email</th>
              <th className={`px-4 py-3 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>Role</th>
              <th className={`px-4 py-3 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isExpanded = expandedUserId === user._id;

              return (
                <Fragment key={user._id}>
                  <tr className={`border-b ${themeMode === 'dark' ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <td className={`px-4 py-3 font-medium ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.fullName}</td>
                    <td className={`px-4 py-3 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.username}</td>
                    <td className={`px-4 py-3 ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.email}</td>
                    <td className={`px-4 py-3 capitalize ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>{user.role}</td>
                    <td className="px-4 py-3 space-x-4">
                      <button
                        onClick={() => handleExpand(user._id)}
                        title="View Profile"
                      >
                        <FaEye className="inline text-lg hover:text-blue-400" />
                      </button>
                      <button
                        onClick={() => setSelectedUserForRoleEdit(user)}
                        title="Edit Role"
                      >
                        <FaUserEdit className="inline text-lg hover:text-green-400" />
                      </button>
                      <button
                        onClick={() => handleDelete(user._id)}
                        title="Delete"
                      >
                        <FaTrash className="inline text-lg hover:text-red-500" />
                      </button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr className={themeMode === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}>
                      <td colSpan="5" className="px-4 py-6">
                        <ProfileForm
                          formData={{
                            fullName: user.fullName || "",
                            bio: user.bio || "",
                            avatarUrl: user.avatarUrl || "",
                            location: user.location || "",
                            website: user.website || "",
                            socialLinks: user.socialLinks || {},
                            competitiveProfiles: user.competitiveProfiles || {},
                            socialStats: user.socialStats || {},
                            competitiveStats: user.competitiveStats || {},
                          }}
                          isEditing={false}
                          hasChanges={false}
                          refreshing={{ type: null }}
                          lastRefreshed={{
                            competitive: user.lastCompetitiveRefresh || null,
                            social: user.lastSocialRefresh || null,
                          }}
                          onChange={() => {}}
                          onSubmit={() => {}}
                          onCancel={() => {}}
                          onEditToggle={() => {}}
                          onRefresh={() => {}}
                          readonly={true}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {/* Role Edit Modal */}
      <RoleEditModal
        isOpen={!!selectedUserForRoleEdit}
        user={selectedUserForRoleEdit}
        onClose={() => setSelectedUserForRoleEdit(null)}
        onConfirm={handleRoleChangeConfirm}
      />
    </div>
  );
}

export default AdminUsersPage;
