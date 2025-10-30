/* src/pages/BlogDetail.jsx */
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check, ArrowLeft } from "lucide-react";

import {
  fetchBlogBySlug,
  toggleBlogLike,
  clearCurrentBlog,
} from "../features/blog/blogSlice";
import {
  Heart,
  MessageCircle,
  Eye,
  Share2,
  Calendar,
  User,
} from "lucide-react";
import Loader from "../components/Loader";
import CommentSection from "../pages/CommentSection";

/* ---------------------------------------------------- */
/*            GITHUB-STYLE CODE BLOCK (COPYABLE)        */
/* ---------------------------------------------------- */
const CodeBlock = ({ language, children }) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(String(children).trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative my-10 -mx-4 sm:-mx-6 lg:-mx-8 overflow-hidden rounded-2xl bg-[#0d1117] shadow-xl border border-gray-800">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#161b22] text-xs text-gray-300 border-b border-gray-800">
        <span className="font-mono font-semibold">{language || "text"}</span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span className="hidden sm:inline">{copied ? "Copied!" : "Copy"}</span>
        </button>
      </div>

      {/* Code */}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language || "text"}
          style={oneDark}
          customStyle={{
            margin: 0,
            padding: "1.5rem",
            fontSize: "0.95rem",
            lineHeight: "1.6",
            background: "transparent",
          }}
          wrapLines={false}
          showLineNumbers={false}
        >
          {String(children).trim()}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

/* ---------------------------------------------------- */
/*                     MAIN COMPONENT                   */
/* ---------------------------------------------------- */
const BlogDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { mode } = useSelector((state) => state.theme);
  const { currentBlog, loading, error } = useSelector((state) => state.blog);
  const { user } = useSelector((state) => state.auth);
  const isDark = mode === "dark";

  useEffect(() => {
    if (slug) dispatch(fetchBlogBySlug(slug));
    return () => dispatch(clearCurrentBlog());
  }, [dispatch, slug]);

  const liked = currentBlog?.likedBy?.includes(user?._id) || false;
  const likeCount = currentBlog?.likes || 0;

  const handleLike = () => {
    if (!user) return navigate("/login");
    dispatch(toggleBlogLike(slug));
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ title: currentBlog.title, url });
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link copied!");
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const readTime = () => {
    const words = currentBlog?.content?.split(/\s+/).length || 0;
    return `${Math.ceil(words / 225)} min read`;
  };

  /* ------------------- LOADING / ERROR ------------------- */
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-950 to-gray-900">
        <Loader />
      </div>
    );
  }

  if (error || !currentBlog) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-950 to-gray-900">
        <div className="text-center p-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {error || "Blog not found."}
          </p>
        </div>
      </div>
    );
  }

  /* ----------------------- RENDER ----------------------- */
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
      {/* Back Button – Sticky, inside content */}
      <button
        onClick={() => navigate(-1)}
        className="sticky top-6 left-6 z-40 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full shadow-lg hover:shadow-xl transition-all text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
      >
        <ArrowLeft size={20} />
        <span className="font-medium hidden sm:inline">Back</span>
      </button>

      {/* Main Content – RESPECTS LEFT SIDEBAR */}
      <article className="max-w-5xl lg:max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-20 pb-24 lg:pl-80">
        {/* Title + Author + Stats */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 lg:p-12 border border-white/50 dark:border-gray-700/60 shadow-2xl mb-12"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-gray-900 to-indigo-900 dark:from-white dark:to-indigo-100 bg-clip-text text-transparent leading-tight mb-6">
            {currentBlog.title}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              {currentBlog.author?.avatarUrl ? (
                <img
                  src={currentBlog.author.avatarUrl}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <User size={24} className="text-white" />
              )}
            </div>
            <div>
              <p className="font-bold text-lg text-gray-900 dark:text-white">
                {currentBlog.author?.fullName || currentBlog.author?.username}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Calendar size={14} />
                {formatDate(currentBlog.publishedAt || currentBlog.createdAt)} · {readTime()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-400 border-t pt-4">
            <div className="flex items-center gap-2">
              <Eye size={16} />
              <span>{currentBlog.views || 0} views</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart size={16} />
              <span>{likeCount} likes</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle size={16} />
              <span>{currentBlog.commentsCount || 0} comments</span>
            </div>
          </div>
        </motion.div>

        {/* Markdown Content */}
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="prose prose-lg sm:prose-xl dark:prose-invert max-w-none"
        >
          <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 lg:p-12 border border-white/50 dark:border-gray-700/60 shadow-2xl">
            {currentBlog.featuredImage && (
              <img
                src={currentBlog.featuredImage}
                alt={currentBlog.title}
                className="w-full h-64 sm:h-80 md:h-96 lg:h-[520px] 2xl:h-[600px] object-cover rounded-3xl shadow-2xl mb-12"
              />
            )}

            <ReactMarkdown
              remarkPlugins={[remarkGfm, remarkMath]}
              rehypePlugins={[rehypeKatex]}
              components={{
                h1: ({ children }) => (
                  <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mt-12 mb-6 text-gray-900 dark:text-white">
                    {children}
                  </h1>
                ),
                h2: ({ children }) => (
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mt-10 mb-5 text-gray-800 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-3">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold mt-8 mb-4 text-gray-700 dark:text-gray-200">
                    {children}
                  </h3>
                ),
                p: ({ children }) => (
                  <p className="text-base sm:text-lg lg:text-xl leading-relaxed mb-6 text-gray-700 dark:text-gray-300">
                    {children}
                  </p>
                ),
                code: ({ inline, className, children }) => {
                  const match = /language-(\w+)/.exec(className || "");
                  return !inline ? (
                    <CodeBlock language={match?.[1]}>{children}</CodeBlock>
                  ) : (
                    <code className="bg-indigo-100 dark:bg-indigo-900/50 px-2 py-1 rounded-lg text-sm font-mono text-indigo-800 dark:text-indigo-200">
                      {children}
                    </code>
                  );
                },
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 pl-6 py-4 my-8 italic text-lg lg:text-xl text-gray-700 dark:text-gray-300 rounded-r-2xl">
                    {children}
                  </blockquote>
                ),
                a: ({ href, children }) => (
                  <a href={href} className="text-indigo-600 dark:text-indigo-400 hover:underline font-semibold">
                    {children}
                  </a>
                ),
                img: ({ src, alt }) => (
                  <img src={src} alt={alt} className="my-12 rounded-3xl shadow-2xl max-w-full h-auto mx-auto block" />
                ),
                ul: ({ children }) => <ul className="list-disc pl-8 space-y-3 my-6">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal pl-8 space-y-3 my-6">{children}</ol>,
              }}
            >
              {currentBlog.content}
            </ReactMarkdown>
          </div>
        </motion.div>

        {/* Like + Share */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-16 flex flex-col sm:flex-row justify-center gap-4"
        >
          <button
            onClick={handleLike}
            className={`flex items-center gap-3 px-8 py-4 rounded-2xl font-bold transition-all shadow-xl hover:shadow-2xl text-lg ${
              liked
                ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                : "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300"
            }`}
          >
            <Heart size={22} className={liked ? "fill-current" : ""} />
            Like ({likeCount})
          </button>

          <button
            onClick={handleShare}
            className="flex items-center gap-3 px-8 py-4 bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 rounded-2xl font-bold hover:bg-white dark:hover:bg-gray-700 transition-all shadow-xl hover:shadow-2xl text-lg"
          >
            <Share2 size={22} />
            Share
          </button>
        </motion.div>

        {/* Comments */}
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="mt-20"
        >
          <CommentSection parentType="Blog" parentId={currentBlog._id} parentSlug={slug} />
        </motion.div>
      </article>
    </motion.div>
  );
};

export default BlogDetail;