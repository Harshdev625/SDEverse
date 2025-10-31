import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  createProblem,
  updateProblem,
  deleteProblem,
  setCurrentSheet,
  setProblems,
} from '../features/problemSheet/problemSheetSlice';
import * as problemSheetAPI from '../features/problemSheet/problemSheetAPI';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Loader from '../components/Loader';

const PLATFORMS = ['leetcode', 'hackerrank', 'codeforces', 'codechef', 'atcoder', 'other'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const SOLUTION_LANGUAGES = ['python', 'javascript', 'java', 'cpp', 'csharp'];

const AdminProblemManagement = () => {
  const { sheetId } = useParams();
  const dispatch = useDispatch();
  const { currentSheet, problems, loading, error } = useSelector((state) => state.problemSheets);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    order: 1,
    difficulty: 'easy',
    platform: 'leetcode',
    platformLink: '',
    tags: [''],
    hints: [{ hintNumber: 1, content: '' }],
    solution: {
      content: {
        python: '',
        javascript: '',
        java: '',
        cpp: '',
        csharp: '',
      },
      explanation: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sheetData, problemsData] = await Promise.all([
          problemSheetAPI.getSheetById(sheetId),
          problemSheetAPI.getSheetProblems(sheetId),
        ]);
        dispatch(setCurrentSheet(sheetData));
        dispatch(setProblems(problemsData.problems || []));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [sheetId, dispatch]);

  const validateForm = () => {
    const errors = {};

    if (!formData.title.trim()) errors.title = 'Title is required';
    if (formData.title.trim().length < 3) errors.title = 'Title must be at least 3 characters';

    if (!formData.description.trim()) errors.description = 'Description is required';
    if (formData.description.trim().length < 10) errors.description = 'Description must be at least 10 characters';

    if (!formData.order || formData.order < 1) errors.order = 'Order must be a positive number';

    if (!formData.platformLink.trim()) errors.platformLink = 'Platform link is required';
    if (!/^https?:\/\/.+/.test(formData.platformLink)) errors.platformLink = 'Must be a valid URL (http/https)';

    if (!Object.values(formData.solution.content).some(code => code.trim())) {
      errors.solution = 'At least one solution code is required';
    }

    if (formData.hints.some(h => !h.content.trim())) {
      errors.hints = 'All hints must have content';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) : value,
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSolutionChange = (lang, value) => {
    setFormData(prev => ({
      ...prev,
      solution: {
        ...prev.solution,
        content: {
          ...prev.solution.content,
          [lang]: value,
        },
      },
    }));
  };

  const handleExplanationChange = (value) => {
    setFormData(prev => ({
      ...prev,
      solution: {
        ...prev.solution,
        explanation: value,
      },
    }));
  };

  const handleHintChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      hints: prev.hints.map((hint, i) =>
        i === index ? { ...hint, [field]: value } : hint
      ),
    }));
  };

  const addHint = () => {
    setFormData(prev => ({
      ...prev,
      hints: [...prev.hints, { hintNumber: prev.hints.length + 1, content: '' }],
    }));
  };

  const removeHint = (index) => {
    setFormData(prev => ({
      ...prev,
      hints: prev.hints
        .filter((_, i) => i !== index)
        .map((hint, i) => ({ ...hint, hintNumber: i + 1 })),
    }));
  };

  const handleTagChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.map((tag, i) => (i === index ? value : tag)),
    }));
  };

  const addTag = () => {
    setFormData(prev => ({
      ...prev,
      tags: [...prev.tags, ''],
    }));
  };

  const removeTag = (index) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const cleanedData = {
      ...formData,
      tags: formData.tags.filter(tag => tag.trim()),
    };

    const result = await dispatch(createProblem({
      sheetId,
      problemData: cleanedData,
    }));

    if (!result.payload?.error) {
      setIsCreateModalOpen(false);
      resetForm();
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const cleanedData = {
      ...formData,
      tags: formData.tags.filter(tag => tag.trim()),
    };

    const result = await dispatch(updateProblem({
      problemId: editingProblem._id,
      problemData: cleanedData,
    }));

    if (!result.payload?.error) {
      setEditingProblem(null);
      resetForm();
    }
  };

  const handleDelete = async (problemId) => {
    if (window.confirm('Are you sure you want to delete this problem? This action cannot be undone.')) {
      await dispatch(deleteProblem(problemId));
    }
  };

  const startEdit = (problem) => {
    setEditingProblem(problem);
    setFormData({
      title: problem.title,
      description: problem.description,
      order: problem.order,
      difficulty: problem.difficulty,
      platform: problem.platform,
      platformLink: problem.platformLink,
      tags: problem.tags && problem.tags.length > 0 ? problem.tags : [''],
      hints: problem.hints && problem.hints.length > 0 ? problem.hints : [{ hintNumber: 1, content: '' }],
      solution: {
        content: problem.solution?.content || {
          python: '',
          javascript: '',
          java: '',
          cpp: '',
          csharp: '',
        },
        explanation: problem.solution?.explanation || '',
      },
    });
    setFormErrors({});
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      order: 1,
      difficulty: 'easy',
      platform: 'leetcode',
      platformLink: '',
      tags: [''],
      hints: [{ hintNumber: 1, content: '' }],
      solution: {
        content: {
          python: '',
          javascript: '',
          java: '',
          cpp: '',
          csharp: '',
        },
        explanation: '',
      },
    });
    setFormErrors({});
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty?.toLowerCase()) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && !currentSheet) return <Loader />;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">{currentSheet?.name}</h1>
          <p className="text-gray-600 mt-2">{currentSheet?.description}</p>
          <p className="text-sm text-gray-500 mt-1">
            Total Problems: {problems.length}
          </p>
        </div>
        <Button 
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
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
        {problems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No problems yet. Click "Add New Problem" to create one.</p>
          </div>
        ) : (
          problems.map((problem) => (
            <Card key={problem._id} className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold">{problem.title}</h3>
                    <span className="text-sm text-gray-500">#{problem.order}</span>
                  </div>
                  <div className="flex gap-2 mb-2 flex-wrap">
                    <span className={`px-2 py-1 rounded text-sm ${getDifficultyColor(problem.difficulty)}`}>
                      {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                    </span>
                    <span className="px-2 py-1 rounded text-sm bg-blue-100 text-blue-800">
                      {problem.platform}
                    </span>
                    {problem.tags && problem.tags.length > 0 && (
                      <div className="flex gap-1 flex-wrap">
                        {problem.tags.map((tag, idx) => (
                          <span key={idx} className="px-2 py-1 rounded text-sm bg-purple-100 text-purple-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-gray-600 mt-2">{problem.description}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    <a href={problem.platformLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      View on {problem.platform}
                    </a>
                  </p>
                </div>
                <div className="flex items-center gap-2 ml-4">
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
          ))
        )}
      </div>

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || editingProblem) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">
              {editingProblem ? 'Edit Problem' : 'Add New Problem'}
            </h2>
            <form onSubmit={editingProblem ? handleUpdate : handleCreate}>
              <div className="space-y-4">
                
                {/* Basic Info */}
                <Input
                  label="Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  error={formErrors.title}
                  required
                />
                
                <Input
                  label="Description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  error={formErrors.description}
                  required
                  textarea
                  rows="3"
                />

                {/* Order, Difficulty, Platform */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Order</label>
                    <input
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleInputChange}
                      min="1"
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                    {formErrors.order && <p className="text-red-600 text-sm mt-1">{formErrors.order}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Difficulty</label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {DIFFICULTIES.map(diff => (
                        <option key={diff} value={diff}>
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Platform</label>
                    <select
                      name="platform"
                      value={formData.platform}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      {PLATFORMS.map(platform => (
                        <option key={platform} value={platform}>
                          {platform.charAt(0).toUpperCase() + platform.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Platform Link */}
                <Input
                  label="Platform Link"
                  name="platformLink"
                  type="url"
                  value={formData.platformLink}
                  onChange={handleInputChange}
                  error={formErrors.platformLink}
                  placeholder="https://leetcode.com/problems/..."
                  required
                />

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  {formData.tags.map((tag, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        value={tag}
                        onChange={(e) => handleTagChange(index, e.target.value)}
                        placeholder={`Tag ${index + 1}`}
                      />
                      {formData.tags.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button
                    type="button"
                    onClick={addTag}
                    className="bg-green-600 hover:bg-green-700 mt-2"
                  >
                    Add Tag
                  </Button>
                </div>

                {/* Hints */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hints</label>
                  {formData.hints.map((hint, index) => (
                    <div key={index} className="mb-2">
                      <Input
                        value={hint.content}
                        onChange={(e) => handleHintChange(index, 'content', e.target.value)}
                        placeholder={`Hint ${index + 1}`}
                        textarea
                        rows="2"
                      />
                      {formData.hints.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeHint(index)}
                          className="bg-red-600 hover:bg-red-700 mt-1"
                        >
                          Remove Hint
                        </Button>
                      )}
                    </div>
                  ))}
                  {formErrors.hints && <p className="text-red-600 text-sm mt-1">{formErrors.hints}</p>}
                  <Button
                    type="button"
                    onClick={addHint}
                    className="bg-green-600 hover:bg-green-700 mt-2"
                  >
                    Add Hint
                  </Button>
                </div>

                {/* Solutions */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Solutions</label>
                  {SOLUTION_LANGUAGES.map(lang => (
                    <div key={lang} className="mb-3">
                      <label className="block text-sm font-medium text-gray-600 mb-1 capitalize">
                        {lang}
                      </label>
                      <textarea
                        value={formData.solution.content[lang]}
                        onChange={(e) => handleSolutionChange(lang, e.target.value)}
                        placeholder={`Enter ${lang} solution code...`}
                        rows="4"
                        className="w-full p-2 border border-gray-300 rounded-md font-mono text-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                  ))}
                  {formErrors.solution && <p className="text-red-600 text-sm">{formErrors.solution}</p>}
                </div>

                {/* Explanation */}
                <Input
                  label="Solution Explanation"
                  value={formData.solution.explanation}
                  onChange={(e) => handleExplanationChange(e.target.value)}
                  textarea
                  rows="3"
                  placeholder="Explain the solution approach..."
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
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
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {loading ? 'Saving...' : (editingProblem ? 'Update' : 'Create')}
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