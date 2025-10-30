import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  fetchBlogForEdit,
  updateExistingBlog,
  clearCurrentBlog,
  deleteExistingBlog,
} from "../features/blog/blogSlice";
import {
  Save,
  X,
  Image,
  Tag,
  Eye,
  EyeOff,
  ArrowLeft,
  Trash2,
} from "lucide-react";
import Button from "../components/ui/Button";
import Loader from "../components/Loader";

const EditBlog = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentBlog, loading } = useSelector((state) => state.blog);
  const { user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: [],
    featuredImage: "",
    isPublished: false,
  });

  const [tagInput, setTagInput] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const titleRef = useRef(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (slug) {
      dispatch(fetchBlogForEdit(slug));
    }

    return () => {
      dispatch(clearCurrentBlog());
    };
  }, [dispatch, slug]);

  const initializedRef = useRef(false);

  // Initialize form data when currentBlog changes
  useEffect(() => {
    if (currentBlog && !initializedRef.current) {
      // eslint-disable-next-line
      setFormData({
        title: currentBlog.title || "",
        content: currentBlog.content || "",
        excerpt: currentBlog.excerpt || "",
        category: currentBlog.category || "",
        tags: currentBlog.tags || [],
        featuredImage: currentBlog.featuredImage || "",
        isPublished: currentBlog.isPublished || false,
      });
      setIsLoading(false);
      initializedRef.current = true;
    }
  }, [currentBlog]);

  // Redirect if not authenticated
  if (!user) {
    navigate("/login");
    return null;
  }

  // Check if user is the author
  if (currentBlog && user && currentBlog.author?._id !== user._id) {
    navigate(`/blogs/${slug}`);
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.content.trim()) {
      newErrors.content = "Content is required";
    }

    if (!formData.category.trim()) {
      newErrors.category = "Category is required";
    }

    if (formData.tags.length === 0) {
      newErrors.tags = "At least one tag is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const blogData = {
        ...formData,
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim() || formData.content.substring(0, 150) + "...",
      };

      await dispatch(updateExistingBlog({ slug, blogData })).unwrap();
      navigate(`/blogs/${slug}`);
    } catch (error) {
      console.error("Failed to update blog:", error);
      setErrors({
        submit: error.message || "Failed to update blog. Please try again."
      });
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const blogData = {
        ...formData,
        content: formData.content.trim(),
        excerpt: formData.excerpt.trim() || formData.content.substring(0, 150) + "...",
        status: "published",
      };

      const updated = await dispatch(updateExistingBlog({ slug, blogData })).unwrap();
      navigate(`/blogs/${updated.slug}`);
    } catch (error) {
      console.error("Failed to publish blog:", error);
      setErrors({
        submit: error.message || "Failed to publish blog. Please try again.",
      });
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) {
      try {
        await dispatch(deleteExistingBlog(slug)).unwrap();
        navigate("/blogs");
      } catch (error) {
        console.error("Failed to delete blog:", error);
        setErrors({
          submit: error.message || "Failed to delete blog. Please try again."
        });
      }
    }
  };

  const categories = [
    "Data Structures",
    "Algorithms",
    "System Design",
    "Programming Languages",
    "Web Development",
    "Mobile Development",
    "DevOps",
    "Machine Learning",
    "Career Advice",
    "Interview Prep",
    "Other"
  ];

  if (isLoading || !currentBlog) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft size={20} />
                <span>Back</span>
              </button>
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit Blog Post
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
                <span className="hidden sm:inline">
                  {showPreview ? "Edit" : "Preview"}
                </span>
              </button>

              <Button
                onClick={handleDelete}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                <Trash2 size={18} className="mr-2" />
                Delete
              </Button>

              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                {loading ? <Loader size="sm" /> : <Save size={18} className="mr-2" />}
                Update
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {errors.submit && (
          <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 rounded-lg">
            {errors.submit}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              ref={titleRef}
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter your blog post title..."
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title}</p>
            )}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white ${
                errors.category ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags *
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-200 text-sm rounded-full"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-red-600 dark:hover:text-red-400"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                placeholder="Add a tag..."
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Tag size={18} />
              </button>
            </div>
            {errors.tags && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tags}</p>
            )}
          </div>

          {/* Excerpt */}
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Excerpt (Optional)
            </label>
            <textarea
              id="excerpt"
              name="excerpt"
              value={formData.excerpt}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
              placeholder="Brief summary of your blog post..."
            />
          </div>

          {/* Featured Image URL */}
          <div>
            <label htmlFor="featuredImage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Featured Image URL (Optional)
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                id="featuredImage"
                name="featuredImage"
                value={formData.featuredImage}
                onChange={handleInputChange}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:text-white"
                placeholder="https://example.com/image.jpg"
              />
              <button
                type="button"
                className="px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Image size={18} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content *
            </label>
            {showPreview ? (
              <div className="min-h-96 p-4 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800">
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <h1>{formData.title || "Blog Title"}</h1>
                  <div dangerouslySetInnerHTML={{ __html: formData.content || "<p>Your content will appear here...</p>" }} />
                </div>
              </div>
            ) : (
              <textarea
                ref={contentRef}
                id="content"
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={20}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white font-mono text-sm ${
                  errors.content ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Write your blog post content here... (HTML supported)"
              />
            )}
            {errors.content && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content}</p>
            )}
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              onClick={() => navigate(-1)}
              variant="secondary"
              className="px-6 py-2"
            >
              Cancel
            </Button>

            <Button
              type="button"
              onClick={handleDelete}
              className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 size={18} className="mr-2" />
              Delete
            </Button>

            <Button
              type="button"
              onClick={handlePublish}
              disabled={loading}
              className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white"
            >
              Publish
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? <Loader size="sm" /> : <Save size={18} className="mr-2" />}
              Update Blog
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditBlog;