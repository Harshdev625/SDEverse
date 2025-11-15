import { useEffect, useState, useCallback, Fragment, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllSheets, 
  createSheet, 
  updateSheet, 
  deleteSheet 
} from '../../features/problemSheet/problemSheetSlice';
import { MdEdit, MdDelete, MdSearch, MdClear, MdArrowForward } from 'react-icons/md';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';
import clsx from 'clsx';

const AdminProblemSheets = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sheets, loading, error } = useSelector((state) => state.problemSheets);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSheet, setEditingSheet] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📋',
    isActive: true
  });
  const [formErrors, setFormErrors] = useState({});

  // Filter sheets based on search and status
  const filteredSheets = useMemo(() => {
    return sheets.filter(sheet => {
      const matchesSearch = sheet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           sheet.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && sheet.isActive) ||
                           (statusFilter === 'inactive' && !sheet.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [sheets, searchQuery, statusFilter]);

  useEffect(() => {
    dispatch(fetchAllSheets());
  }, [dispatch]);

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters';
    } else if (formData.name.trim().length > 100) {
      errors.name = 'Name must be at most 100 characters';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 500) {
      errors.description = 'Description must be at most 500 characters';
    }

    if (formData.icon && formData.icon.length > 5) {
      errors.icon = 'Icon must be at most 5 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCreate = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(createSheet(formData))
      .unwrap()
      .then(() => {
        toast.success('Problem sheet created successfully');
        setIsCreateModalOpen(false);
        setFormData({ name: '', description: '', icon: '📋', isActive: true });
        setFormErrors({});
      })
      .catch(() => toast.error('Failed to create problem sheet'));
  }, [dispatch, formData]);

  const handleUpdate = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    dispatch(updateSheet({
      slug: editingSheet.slug,
      sheetData: formData
    }))
      .unwrap()
      .then(() => {
        toast.success('Problem sheet updated successfully');
        setEditingSheet(null);
        setFormData({ name: '', description: '', icon: '📋', isActive: true });
        setFormErrors({});
      })
      .catch(() => toast.error('Failed to update problem sheet'));
  }, [dispatch, editingSheet, formData]);

  const handleDelete = useCallback((e, slug) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this problem sheet and all its problems?')) {
      dispatch(deleteSheet(slug))
        .unwrap()
        .then(() => toast.success('Problem sheet deleted successfully'))
        .catch(() => toast.error('Failed to delete problem sheet'));
    }
  }, [dispatch]);

  const startEdit = (e, sheet) => {
    e.stopPropagation();
    setEditingSheet(sheet);
    setFormData({
      name: sheet.name,
      description: sheet.description,
      icon: sheet.icon,
      isActive: sheet.isActive ?? true
    });
    setFormErrors({});
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', icon: '📋', isActive: true });
    setFormErrors({});
  };

  const handleRowClick = (sheetId) => {
    navigate(`/admin/manage-problems/${sheetId}`);
  };

  if (loading && !sheets.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Problem Sheets</h1>
        <button
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-colors"
        >
          + New Sheet
        </button>
      </div>

      {/* Search and Filter */}
      <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-xl">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or description..."
            className={clsx(
              'w-full pl-10 pr-10 py-2 rounded-xl border transition-colors',
              'bg-white dark:bg-gray-900 text-gray-800 dark:text-white',
              'border-gray-300 dark:border-gray-700',
              'focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Clear search"
            >
              <MdClear size={20} />
            </button>
          )}
        </div>

        {/* Status Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          {['all', 'active', 'inactive'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-medium transition-colors border',
                statusFilter === status
                  ? 'bg-blue-600 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-600'
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-400'
              )}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>

        {/* Results Info */}
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {searchQuery || statusFilter !== 'all' ? (
            <>Showing <span className="font-medium">{filteredSheets.length}</span> of <span className="font-medium">{sheets.length}</span> sheets</>
          ) : (
            <>Total: <span className="font-medium">{sheets.length}</span> sheets</>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Sheet Table */}
      <div className="w-full overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
        <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white text-xs uppercase">
            <tr>
              <th className="px-6 py-3">Icon</th>
              <th className="px-6 py-3">Name</th>
              <th className="px-6 py-3">Description</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSheets.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {searchQuery || statusFilter !== 'all' 
                    ? 'No problem sheets match your search or filter.'
                    : 'No problem sheets found. Click "New Sheet" to create one.'}
                </td>
              </tr>
            ) : (
              filteredSheets.map((sheet) => (
                <Fragment key={sheet._id}>
                  <tr 
                    onClick={() => handleRowClick(sheet._id)}
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition cursor-pointer group"
                  >
                    <td className="px-6 py-4 text-2xl">{sheet.icon}</td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {sheet.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400 max-w-xs truncate">
                      {sheet.description}
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx(
                        'px-3 py-1 rounded-full text-xs font-medium',
                        sheet.isActive
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                          : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                      )}>
                        {sheet.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-4">
                      <button
                        onClick={(e) => startEdit(e, sheet)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition"
                        title="Edit"
                      >
                        <MdEdit size={18} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, sheet.slug)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition"
                        title="Delete"
                      >
                        <MdDelete size={18} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRowClick(sheet._id);
                        }}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition opacity-0 group-hover:opacity-100"
                        title="Manage Problems"
                      >
                        <MdArrowForward size={18} />
                      </button>
                    </td>
                  </tr>
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || editingSheet) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingSheet ? 'Edit Problem Sheet' : 'Create New Problem Sheet'}
            </h2>
            <form onSubmit={editingSheet ? handleUpdate : handleCreate} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., LeetCode 100 Must Do"
                  className={clsx(
                    'w-full px-3 py-2 rounded-lg border transition-colors',
                    'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                    'border-gray-300 dark:border-gray-600',
                    'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    formErrors.name && 'border-red-500 dark:border-red-500'
                  )}
                  required
                />
                {formErrors.name && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe this problem sheet..."
                  rows="3"
                  className={clsx(
                    'w-full px-3 py-2 rounded-lg border transition-colors resize-none',
                    'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                    'border-gray-300 dark:border-gray-600',
                    'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    formErrors.description && 'border-red-500 dark:border-red-500'
                  )}
                  required
                />
                {formErrors.description && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{formErrors.description}</p>
                )}
              </div>

              {/* Icon */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Icon
                </label>
                <input
                  type="text"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  placeholder="📚"
                  maxLength="5"
                  className={clsx(
                    'w-full px-3 py-2 rounded-lg border transition-colors',
                    'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                    'border-gray-300 dark:border-gray-600',
                    'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                    formErrors.icon && 'border-red-500 dark:border-red-500'
                  )}
                />
                {formErrors.icon && (
                  <p className="text-red-600 dark:text-red-400 text-sm mt-1">{formErrors.icon}</p>
                )}
              </div>

              {/* Status */}
              <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 cursor-pointer"
                />
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Active
                </label>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingSheet(null);
                    resetForm();
                  }}
                  className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={clsx(
                    'px-4 py-2 rounded-lg text-white transition-colors',
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  )}
                >
                  {loading ? 'Saving...' : (editingSheet ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProblemSheets;