import React, { useEffect, useState, useCallback, Fragment, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSheetById,
  fetchSheetProblems,
  createProblem,
  updateProblem,
  deleteProblem,
} from '../../features/problemSheet/problemSheetSlice';
import { MdEdit, MdDelete, MdArrowBack, MdSearch, MdClear } from 'react-icons/md';
import { toast } from 'react-toastify';
import Loader from '../../components/Loader';
import clsx from 'clsx';

const PLATFORMS = ['leetcode', 'hackerrank', 'codeforces', 'codechef', 'atcoder', 'other'];
const DIFFICULTIES = ['easy', 'medium', 'hard'];
const SOLUTION_LANGUAGES = ['python', 'javascript', 'java', 'cpp', 'csharp'];

const AdminProblemManagement = () => {
  const { sheetId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentSheet, problems, loading, error } = useSelector((state) => state.problemSheets);
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
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

  // Filter problems based on search query
  const filteredProblems = useMemo(() => {
    if (!searchQuery.trim()) return problems;
    
    return problems.filter(problem => {
      const title = problem.title || '';
      const description = problem.description || '';
      const query = searchQuery.toLowerCase();
      
      return (
        title.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query)
      );
    });
  }, [problems, searchQuery]);

  useEffect(() => {
    if (sheetId) {
      dispatch(fetchSheetById(sheetId));
      dispatch(fetchSheetProblems({ sheetId, params: {} }));
    }
  }, [sheetId, dispatch]);

  // Reset search when component unmounts or sheet changes
  useEffect(() => {
    return () => setSearchQuery('');
  }, [sheetId]);

  const validateForm = useCallback(() => {
    const errors = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    } else if (formData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    }

    if (!formData.order || formData.order < 1) {
      errors.order = 'Order must be a positive number';
    }

    if (!formData.platformLink.trim()) {
      errors.platformLink = 'Platform link is required';
    } else if (!/^https?:\/\/.+/.test(formData.platformLink)) {
      errors.platformLink = 'Must be a valid URL (http/https)';
    }

    if (!Object.values(formData.solution.content).some(code => code.trim())) {
      errors.solution = 'At least one solution code is required';
    }

    if (formData.hints.some(h => !h.content.trim())) {
      errors.hints = 'All hints must have content';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'order' ? parseInt(value) || 1 : value,
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

  const handleCreate = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const cleanedData = {
      ...formData,
      tags: formData.tags.filter(tag => tag.trim()),
    };

    dispatch(createProblem({
      sheetId,
      problemData: cleanedData,
    }))
      .unwrap()
      .then(() => {
        toast.success('Problem created successfully');
        setIsCreateModalOpen(false);
        resetForm();
        dispatch(fetchSheetProblems({ sheetId, params: {} }));
      })
      .catch(() => toast.error('Failed to create problem'));
  }, [dispatch, formData, sheetId, validateForm]);

  const handleUpdate = useCallback(async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const cleanedData = {
      ...formData,
      tags: formData.tags.filter(tag => tag.trim()),
    };

    dispatch(updateProblem({
      problemId: editingProblem._id,
      problemData: cleanedData,
    }))
      .unwrap()
      .then(() => {
        toast.success('Problem updated successfully');
        setEditingProblem(null);
        resetForm();
        dispatch(fetchSheetProblems({ sheetId, params: {} }));
      })
      .catch(() => toast.error('Failed to update problem'));
  }, [dispatch, editingProblem, formData, sheetId, validateForm]);

  const handleDelete = useCallback((problemId) => {
    if (window.confirm('Are you sure you want to delete this problem? This action cannot be undone.')) {
      dispatch(deleteProblem(problemId))
        .unwrap()
        .then(() => {
          toast.success('Problem deleted successfully');
          dispatch(fetchSheetProblems({ sheetId, params: {} }));
        })
        .catch(() => toast.error('Failed to delete problem'));
    }
  }, [dispatch, sheetId]);

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
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200';
      case 'medium':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200';
      case 'hard':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200';
      default:
        return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200';
    }
  };

  if (loading && !currentSheet) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Back to Problem Sheets"
          >
            <MdArrowBack size={24} className="text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              {currentSheet?.icon} {currentSheet?.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">{currentSheet?.description}</p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {searchQuery ? `${filteredProblems.length} of ${problems.length}` : problems.length} problem{problems.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            resetForm();
            setIsCreateModalOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl transition-colors"
        >
          + Add Problem
        </button>
      </div>

      {/* Search Bar */}
      <div className="space-y-4 bg-white dark:bg-gray-800 p-4 rounded-xl">
        <div className="relative">
          <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems by title or description..."
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
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      {/* Problems Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
        <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white text-xs uppercase">
            <tr>
              <th className="px-6 py-3">#</th>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Difficulty</th>
              <th className="px-6 py-3">Platform</th>
              <th className="px-6 py-3">Tags</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProblems.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-500 dark:text-gray-400">
                  {searchQuery 
                    ? 'No problems match your search.'
                    : 'No problems yet. Click "Add Problem" to create one.'}
                </td>
              </tr>
            ) : (
              filteredProblems.map((problem) => (
                <Fragment key={problem._id}>
                  <tr className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {problem.order}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white max-w-xs">
                      <div className="truncate">{problem.title}</div>
                      <a
                        href={problem.platformLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 dark:text-blue-400 hover:underline text-xs"
                      >
                        View Problem
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <span className={clsx('px-2 py-1 rounded text-xs font-medium', getDifficultyColor(problem.difficulty))}>
                        {problem.difficulty?.charAt(0).toUpperCase() + problem.difficulty?.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                        {problem.platform}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {problem.tags && problem.tags.length > 0 ? (
                        <div className="flex gap-1 flex-wrap">
                          {problem.tags.slice(0, 2).map((tag, idx) => (
                            <span key={idx} className="px-2 py-1 rounded text-xs bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">
                              {tag}
                            </span>
                          ))}
                          {problem.tags.length > 2 && (
                            <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                              +{problem.tags.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-4">
                      <button
                        onClick={() => startEdit(problem)}
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition"
                        title="Edit"
                      >
                        <MdEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(problem._id)}
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition"
                        title="Delete"
                      >
                        <MdDelete size={18} />
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
      {(isCreateModalOpen || editingProblem) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingProblem ? 'Edit Problem' : 'Create New Problem'}
            </h2>

            <form onSubmit={editingProblem ? handleUpdate : handleCreate} className="space-y-6">
              {/* Basic Info Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Information</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Problem title"
                    className={clsx(
                      'w-full px-3 py-2 rounded-lg border transition-colors',
                      'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                      'border-gray-300 dark:border-gray-600',
                      'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                      formErrors.title && 'border-red-500'
                    )}
                    required
                  />
                  {formErrors.title && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{formErrors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Problem description"
                    rows="3"
                    className={clsx(
                      'w-full px-3 py-2 rounded-lg border transition-colors resize-none',
                      'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                      'border-gray-300 dark:border-gray-600',
                      'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                      formErrors.description && 'border-red-500'
                    )}
                    required
                  />
                  {formErrors.description && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{formErrors.description}</p>
                  )}
                </div>

                {/* Grid: Order, Difficulty, Platform */}
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Order *
                    </label>
                    <input
                      type="number"
                      name="order"
                      value={formData.order}
                      onChange={handleInputChange}
                      min="1"
                      className={clsx(
                        'w-full px-3 py-2 rounded-lg border transition-colors',
                        'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                        'border-gray-300 dark:border-gray-600',
                        'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                        formErrors.order && 'border-red-500'
                      )}
                      required
                    />
                    {formErrors.order && (
                      <p className="text-red-600 dark:text-red-400 text-sm mt-1">{formErrors.order}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Difficulty *
                    </label>
                    <select
                      name="difficulty"
                      value={formData.difficulty}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {DIFFICULTIES.map(diff => (
                        <option key={diff} value={diff}>
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Platform *
                    </label>
                    <select
                      name="platform"
                      value={formData.platform}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Platform Link *
                  </label>
                  <input
                    type="url"
                    name="platformLink"
                    value={formData.platformLink}
                    onChange={handleInputChange}
                    placeholder="https://leetcode.com/problems/..."
                    className={clsx(
                      'w-full px-3 py-2 rounded-lg border transition-colors',
                      'bg-white dark:bg-gray-800 text-gray-900 dark:text-white',
                      'border-gray-300 dark:border-gray-600',
                      'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                      formErrors.platformLink && 'border-red-500'
                    )}
                    required
                  />
                  {formErrors.platformLink && (
                    <p className="text-red-600 dark:text-red-400 text-sm mt-1">{formErrors.platformLink}</p>
                  )}
                </div>
              </div>

              {/* Tags Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Tags</h3>
                {formData.tags.map((tag, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={tag}
                      onChange={(e) => handleTagChange(index, e.target.value)}
                      placeholder={`Tag ${index + 1}`}
                      className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {formData.tags.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTag(index)}
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                >
                  + Add Tag
                </button>
              </div>

              {/* Hints Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Hints</h3>
                {formData.hints.map((hint, index) => (
                  <div key={index} className="space-y-2">
                    <textarea
                      value={hint.content}
                      onChange={(e) => handleHintChange(index, 'content', e.target.value)}
                      placeholder={`Hint ${index + 1}`}
                      rows="2"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {formData.hints.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeHint(index)}
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
                      >
                        Remove Hint
                      </button>
                    )}
                  </div>
                ))}
                {formErrors.hints && (
                  <p className="text-red-600 dark:text-red-400 text-sm">{formErrors.hints}</p>
                )}
                <button
                  type="button"
                  onClick={addHint}
                  className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                >
                  + Add Hint
                </button>
              </div>

              {/* Solutions Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Solutions *</h3>
                {SOLUTION_LANGUAGES.map(lang => (
                  <div key={lang}>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 capitalize">
                      {lang}
                    </label>
                    <textarea
                      value={formData.solution.content[lang]}
                      onChange={(e) => handleSolutionChange(lang, e.target.value)}
                      placeholder={`Enter ${lang} solution code...`}
                      rows="4"
                      className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                ))}
                {formErrors.solution && (
                  <p className="text-red-600 dark:text-red-400 text-sm">{formErrors.solution}</p>
                )}
              </div>

              {/* Explanation Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Solution Explanation</h3>
                <textarea
                  value={formData.solution.explanation}
                  onChange={(e) => handleExplanationChange(e.target.value)}
                  placeholder="Explain the solution approach..."
                  rows="4"
                  className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setEditingProblem(null);
                    resetForm();
                  }}
                  className="px-6 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={clsx(
                    'px-6 py-2 rounded-lg text-white transition-colors',
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  )}
                >
                  {loading ? 'Saving...' : (editingProblem ? 'Update' : 'Create')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProblemManagement;