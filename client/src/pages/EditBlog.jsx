import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Trash2, Tag, Image, X, Loader2 } from "lucide-react";
import clsx from "clsx";

import {
  fetchBlogForEdit,
  updateExistingBlog,
  clearCurrentBlog,
  deleteExistingBlog,
} from "../features/blog/blogSlice";
import Loader from "../components/Loader";
import BlogDetail from "./BlogDetail";

const EditBlog = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentBlog } = useSelector((state) => state.blog);
  const { user } = useSelector((state) => state.auth);
  const isDark = useSelector((state) => state.theme.mode === "dark");

  const [isUpdating, setIsUpdating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    excerpt: "",
    category: "",
    tags: [],
    featuredImage: "",
    isPublished: false,
    author: null,
    likes: 0,
    views: 0,
    commentsCount: 0,
    publishedAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    _id: "",
    slug: "",
  });

  const [tagInput, setTagInput] = useState("");
  const [activeTab, setActiveTab] = useState("edit");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  const initializedRef = useRef(false);

  useEffect(() => {
    if (slug) dispatch(fetchBlogForEdit(slug));
    return () => dispatch(clearCurrentBlog());
  }, [dispatch, slug]);

  useEffect(() => {
    if (currentBlog && !initializedRef.current) {
      setFormData({
        ...currentBlog,
        author: currentBlog.author || {
          fullName: user?.fullName || "You",
          avatarUrl: user?.avatarUrl,
        },
      });
      setIsLoading(false);
      initializedRef.current = true;
    }
  }, [currentBlog, user]);

  if (!user) {
    navigate("/login");
    return null;
  }

  if (currentBlog && user && currentBlog.author?._id !== user._id) {
    navigate(-1); // Go back instead of direct to blog
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
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
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.content.trim()) newErrors.content = "Content is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    if (formData.tags.length === 0) newErrors.tags = "At least one tag is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsUpdating(true);
    const blogData = {
      ...formData,
      content: formData.content.trim(),
      excerpt: formData.excerpt.trim() || formData.content.substring(0, 150) + "...",
    };

    try {
      await dispatch(updateExistingBlog({ slug, blogData })).unwrap();
      navigate(-1); // Go back after update
    } catch (error) {
      setErrors({ submit: error.message || "Failed to update blog." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePublish = async () => {
    if (!validateForm()) return;

    setIsPublishing(true);
    const blogData = {
      ...formData,
      content: formData.content.trim(),
      excerpt: formData.excerpt.trim() || formData.content.substring(0, 150) + "...",
      isPublished: true,
    };

    try {
      const updated = await dispatch(updateExistingBlog({ slug, blogData })).unwrap();
      navigate(`/blogs/${updated.slug}`);
    } catch (error) {
      setErrors({ submit: error.message || "Failed to publish blog." });
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this blog post? This action cannot be undone.")) return;

    setIsDeleting(true);
    try {
      await dispatch(deleteExistingBlog(slug)).unwrap();
      navigate("/blogs");
    } catch (error) {
      setErrors({ submit: error.message || "Failed to delete blog." });
    } finally {
      setIsDeleting(false);
    }
  };

  const categories = [
    "Data Structures", "Algorithms", "System Design", "Programming Languages",
    "Web Development", "Mobile Development", "DevOps", "Machine Learning",
    "Career Advice", "Interview Prep", "Other"
  ];

  if (isLoading || !currentBlog) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-950 to-gray-900">
        <Loader />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`min-h-screen ${
        isDark
          ? "bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950"
          : "bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50"
      }`}
    >
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="sticky top-6 left-6 z-40 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full shadow-lg hover:shadow-xl transition-all text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
      >
        <ArrowLeft size={20} />
        <span className="font-medium hidden sm:inline">Back</span>
      </button>

      {/* Main Container */}
      <article className="max-w-5xl lg:max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl border border-white/50 dark:border-gray-700/60 shadow-2xl overflow-hidden"
        >
          {/* Tab Header */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="flex">
              <button
                onClick={() => setActiveTab("edit")}
                className={clsx(
                  "flex-1 py-4 px-6 text-lg font-semibold transition-all",
                  activeTab === "edit"
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                Edit
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={clsx(
                  "flex-1 py-4 px-6 text-lg font-semibold transition-all",
                  activeTab === "preview"
                    ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                )}
              >
                Preview
              </button>
            </div>
          </div>

          {/* Edit Tab */}
          {activeTab === "edit" && (
            <div className="p-6 sm:p-8 lg:p-12 2xl:p-16">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-900 dark:text-white mb-8">
                Edit Blog Post
              </h1>

              {errors.submit && (
                <div className="mb-8 p-4 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 rounded-xl">
                  {errors.submit}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className={`w-full px-5 py-4 rounded-xl border text-lg ${
                      errors.title ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-white`}
                    placeholder="Enter your blog post title..."
                  />
                  {errors.title && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.title}</p>}
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-5 py-4 rounded-xl border text-lg ${
                      errors.category ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-white`}
                  >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.category}</p>}
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Tags *
                  </label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 text-indigo-800 dark:text-indigo-200 text-sm font-medium rounded-full"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="flex-1 px-5 py-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-white"
                      placeholder="Add a tag..."
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      <Tag size={20} />
                    </button>
                  </div>
                  {errors.tags && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.tags}</p>}
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Excerpt (Optional)
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-5 py-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-white resize-none"
                    placeholder="Brief summary of your blog post..."
                  />
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Featured Image URL (Optional)
                  </label>
                  <div className="flex gap-3">
                    <input
                      type="url"
                      name="featuredImage"
                      value={formData.featuredImage}
                      onChange={handleInputChange}
                      className="flex-1 px-5 py-4 rounded-xl border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-white"
                      placeholder="https://example.com/image.jpg"
                    />
                    <button
                      type="button"
                      className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl shadow-md hover:shadow-lg transition-all"
                    >
                      <Image size={20} />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    Content *
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleInputChange}
                    rows={22}
                    className={`w-full px-5 py-5 rounded-xl border font-mono text-base leading-relaxed ${
                      errors.content ? "border-red-500" : "border-gray-300 dark:border-gray-600"
                    } bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-gray-900 dark:text-white resize-none`}
                    placeholder="Write your blog post in Markdown..."
                  />
                  {errors.content && <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.content}</p>}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row justify-end gap-4 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <button
                    type="button"
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className={clsx(
                      "flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all min-w-[180px]",
                      "bg-gradient-to-r from-red-500 to-pink-500 text-white hover:shadow-xl",
                      isDeleting && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    {isDeleting ? <Loader2 className="animate-spin" size={22} /> : <Trash2 size={22} />}
                    <span>Delete</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className={clsx(
                      "flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all min-w-[180px]",
                      "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-xl",
                      isPublishing && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    {isPublishing ? <Loader2 className="animate-spin" size={22} /> : "Publish"}
                  </button>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className={clsx(
                      "flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all min-w-[180px]",
                      "bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-xl",
                      isUpdating && "opacity-70 cursor-not-allowed"
                    )}
                  >
                    {isUpdating ? <Loader2 className="animate-spin" size={22} /> : <Save size={22} />}
                    <span>{isUpdating ? "Updating..." : "Update"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Preview Tab */}
          {activeTab === "preview" && (
            <div className="p-0">
              <BlogDetail overrideBlog={formData} isPreviewMode={true} />
            </div>
          )}
        </motion.div>
      </article>
    </motion.div>
  );
};

export default EditBlog;