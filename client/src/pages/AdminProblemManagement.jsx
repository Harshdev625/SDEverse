import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  createProblem,
  updateProblem,
  deleteProblem,
  setCurrentSheet
} from '../features/problemSheet/problemSheetSlice';
import * as problemSheetAPI from '../features/problemSheet/problemSheetAPI';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Loader from '../components/Loader';

const AdminProblemManagement = () => {
  const { sheetId } = useParams();
  const dispatch = useDispatch();
  const { currentSheet, problems, loading, error } = useSelector((state) => state.problemSheets);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'EASY',
    category: 'ARRAYS',
    hints: [''],
    solution: '',
    isActive: true
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sheetData, problemsData] = await Promise.all([
          problemSheetAPI.getSheetById(sheetId),
          problemSheetAPI.getSheetProblems(sheetId)
        ]);
        dispatch(setCurrentSheet(sheetData));
        dispatch({ type: 'problemSheets/setProblems', payload: problemsData });
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [sheetId, dispatch]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleHintChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      hints: prev.hints.map((hint, i) => i === index ? value : hint)
    }));
  };

  const addHint = () => {
    setFormData(prev => ({
      ...prev,
      hints: [...prev.hints, '']
    }));
  };

  const removeHint = (index) => {
    setFormData(prev => ({
      ...prev,
      hints: prev.hints.filter((_, i) => i !== index)
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    const result = await dispatch(createProblem({
      sheetId,
      problemData: formData
    }));
    if (!result.error) {
      setIsCreateModalOpen(false);
      resetForm();
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    const result = await dispatch(updateProblem({
      problemId: editingProblem._id,
      problemData: formData
    }));
    if (!result.error) {
      setEditingProblem(null);
      resetForm();
    }
  };

  const handleDelete = async (problemId) => {
    if (window.confirm('Are you sure you want to delete this problem?')) {
      await dispatch(deleteProblem(problemId));
    }
  };

  const startEdit = (problem) => {
    setEditingProblem(problem);
    setFormData({
      title: problem.title,
      description: problem.description,
      difficulty: problem.difficulty,
      category: problem.category,
      hints: problem.hints,
      solution: problem.solution,
      isActive: problem.isActive
    });
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      difficulty: 'EASY',
      category: 'ARRAYS',
      hints: [''],
      solution: '',
      isActive: true
    });
  };

  if (loading && !currentSheet) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{currentSheet?.name}</h1>
          <p className="text-gray-600 mt-2">{currentSheet?.description}</p>
        </div>
        <Button 
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add New Problem
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Problems List */}
      <div className="space-y-4">
        {problems.map((problem) => (
          <Card key={problem._id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{problem.title}</h3>
                <div className="flex gap-2 mt-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    problem.difficulty === 'EASY' ? 'bg-green-100 text-green-800' :
                    problem.difficulty === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {problem.difficulty}
                  </span>
                  <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">
                    {problem.category}
                  </span>
                </div>
                <p className="text-gray-600 mt-2">{problem.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  onClick={() => startEdit(problem)}
                  className="bg-yellow-600 hover:bg-yellow-700"
                >
                  Edit
                </Button>
                <Button 
                  onClick={() => handleDelete(problem._id)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || editingProblem) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingProblem ? 'Edit Problem' : 'Add New Problem'}
            </h2>
            <form onSubmit={editingProblem ? handleUpdate : handleCreate}>
              <div className="space-y-4">
                <Input
                  label="Title"
                  name="title"
                  value={formData.title}
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="EASY">Easy</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HARD">Hard</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="ARRAYS">Arrays</option>
                      <option value="STRINGS">Strings</option>
                      <option value="LINKED_LISTS">Linked Lists</option>
                      <option value="TREES">Trees</option>
                      <option value="GRAPHS">Graphs</option>
                      <option value="DP">Dynamic Programming</option>
                    </select>
                  </div>
                </div>
                
                {/* Hints */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hints</label>
                  {formData.hints.map((hint, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        value={hint}
                        onChange={(e) => handleHintChange(index, e.target.value)}
                        placeholder={`Hint ${index + 1}`}
                      />
                      <Button
                        type="button"
                        onClick={() => removeHint(index)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={addHint}
                    className="bg-green-600 hover:bg-green-700 mt-2"
                  >
                    Add Hint
                  </Button>
                </div>

                <Input
                  label="Solution"
                  name="solution"
                  value={formData.solution}
                  onChange={handleInputChange}
                  required
                  textarea
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
                    setEditingProblem(null);
                    resetForm();
                  }}
                  className="bg-gray-500 hover:bg-gray-600"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {editingProblem ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProblemManagement;