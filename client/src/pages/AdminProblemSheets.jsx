import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  fetchAllSheets, 
  createSheet, 
  updateSheet, 
  deleteSheet 
} from '../features/problemSheet/problemSheetSlice';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Loader from '../components/Loader';

const AdminProblemSheets = () => {
  const dispatch = useDispatch();
  const { sheets, loading, error } = useSelector((state) => state.problemSheets);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSheet, setEditingSheet] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '📋',
    isActive: true
  });

  useEffect(() => {
    dispatch(fetchAllSheets());
  }, [dispatch]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const result = await dispatch(createSheet(formData));
    if (!result.error) {
      setIsCreateModalOpen(false);
      setFormData({ name: '', description: '', icon: '📋', isActive: true });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateSheet({
      slug: editingSheet.slug,
      sheetData: formData
    }));
    if (!result.error) {
      setEditingSheet(null);
      setFormData({ name: '', description: '', icon: '📋', isActive: true });
    }
  };

  const handleDelete = async (slug) => {
    if (window.confirm('Are you sure you want to delete this problem sheet?')) {
      await dispatch(deleteSheet(slug));
    }
  };

  const startEdit = (sheet) => {
    setEditingSheet(sheet);
    setFormData({
      name: sheet.name,
      description: sheet.description,
      icon: sheet.icon,
      isActive: sheet.isActive
    });
  };

  if (loading && !sheets.length) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Problem Sheets Management</h1>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Create New Sheet
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Sheet List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sheets.map((sheet) => (
          <Card key={sheet._id} className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <span>{sheet.icon}</span>
                  {sheet.name}
                </h3>
                <p className="text-gray-600 mt-2">{sheet.description}</p>
              </div>
              <div className={`px-2 py-1 rounded text-sm ${
                sheet.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {sheet.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <Button 
                onClick={() => startEdit(sheet)}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                Edit
              </Button>
              <Button 
                onClick={() => handleDelete(sheet.slug)}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || editingSheet) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {editingSheet ? 'Edit Problem Sheet' : 'Create New Problem Sheet'}
            </h2>
            <form onSubmit={editingSheet ? handleUpdate : handleCreate}>
              <div className="space-y-4">
                <Input
                  label="Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  textarea
                />
                <Input
                  label="Icon"
                  name="icon"
                  value={formData.icon}
                  onChange={handleInputChange}
                  maxLength={5}
                />
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="w-4 h-4"
                  />
                  <label>Active</label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <Button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingSheet(null);
                    setFormData({ name: '', description: '', icon: '📋', isActive: true });
                  }}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {editingSheet ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProblemSheets;