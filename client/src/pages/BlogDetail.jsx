import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { prism } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Copy,
  Check,
  ArrowLeft,
  Heart,
  MessageCircle,
  Eye,
  Share2,
  Calendar,
  User,
} from "lucide-react";
import clsx from "clsx";

import {
  fetchBlogBySlug,
  toggleBlogLike,
  clearCurrentBlog,
} from "../features/blog/blogSlice";
import Loader from "../components/Loader";
import CommentSection from "../pages/CommentSection";

const useDarkMode = () => {
  const { mode } = useSelector((state) => state.theme);
  return mode === "dark";
};

const CodeBlock = ({ node, inline, className, children, ...props }) => {
  const dark = useDarkMode();
  const match = /language-(\w+)/.exec(className || "");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(String(children).trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!inline && match) {
    return (
      <div className="my-6 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
          <span className="font-mono">{match[1]}</span>
          <button
            onClick={copy}
            className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span className="hidden sm:inline">
              {copied ? "Copied!" : "Copy"}
            </span>
          </button>
        </div>
        <SyntaxHighlighter
          style={dark ? vscDarkPlus : prism}
          language={match[1]}
          PreTag="div"
          customStyle={{ margin: 0 }}
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      </div>
    );
  }

  return (
    <code
      className={clsx(
        "px-1.5 py-0.5 rounded text-sm font-mono",
        "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200",
        className
      )}
      {...props}
    >
      {children}
    </code>
  );
};

const Heading = ({ level, children }) => {
  const Tag = `h${level}`;
  const base = "font-bold text-gray-900 dark:text-gray-100 mt-8 mb-4";
  const sizes = {
    1: "text-4xl sm:text-5xl md:text-6xl",
    2: "text-3xl sm:text-4xl",
    3: "text-2xl sm:text-3xl",
    4: "text-xl sm:text-2xl",
    5: "text-lg sm:text-xl",
    6: "text-base sm:text-lg",
  };
  return <Tag className={clsx(base, sizes[level])}>{children}</Tag>;
};

const Paragraph = ({ children }) => (
  <p className="my-4 text-base leading-relaxed text-gray-700 dark:text-gray-300">{children}</p>
);

const List = ({ ordered, children }) => {
  const Tag = ordered ? "ol" : "ul";
  return (
    <Tag className={clsx("my-4 space-y-2", ordered ? "list-decimal pl-6" : "list-disc pl-6")}>
      {children}
    </Tag>
  );
};

const ListItem = ({ children }) => (
  <li className="text-gray-700 dark:text-gray-300">{children}</li>
);

const Blockquote = ({ children }) => (
  <blockquote className="my-6 border-l-4 border-indigo-500 pl-4 italic text-gray-600 dark:text-gray-400">
    {children}
  </blockquote>
);

const Table = ({ children }) => (
  <div className="my-6 overflow-x-auto">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">{children}</table>
  </div>
);

const TableHead = ({ children }) => (
  <thead className="bg-gray-50 dark:bg-gray-800">
    <tr>{children}</tr>
  </thead>
);

const TableBody = ({ children }) => (
  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">{children}</tbody>
);

const TableRow = ({ children }) => <tr>{children}</tr>;

const TableCell = ({ children }) => (
  <td className="px-3 py-2 text-sm text-gray-700 dark:text-gray-300">{children}</td>
);

const TableHeaderCell = ({ children }) => (
  <th className="px-3 py-2 text-left text-sm font-medium text-gray-900 dark:text-gray-100">
    {children}
  </th>
);

const BlogDetail = ({ overrideBlog, isPreviewMode = false }) => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    currentBlog: reduxBlog,
    loading,
    error,
  } = useSelector((state) => state.blog);
  const { user } = useSelector((state) => state.auth);
  const isDark = useDarkMode();

  const blog = overrideBlog || reduxBlog;

  useEffect(() => {
    if (!isPreviewMode && slug) {
      dispatch(fetchBlogBySlug(slug));
    }
    return () => {
      if (!isPreviewMode) dispatch(clearCurrentBlog());
    };
  }, [dispatch, slug, isPreviewMode]);

  const liked = blog?.likedBy?.includes(user?._id) || false;
  const likeCount = blog?.likes || 0;

  const handleLike = () => {
    if (!user) return navigate("/login");
    if (isPreviewMode) return;
    dispatch(toggleBlogLike(slug));
  };

  const handleShare = async () => {
    const url = isPreviewMode
      ? window.location.href
      : `${window.location.origin}/blogs/${slug}`;
    if (navigator.share) {
      await navigator.share({ title: blog.title, url });
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
    const words = blog?.content?.split(/\s+/).length || 0;
    return `${Math.ceil(words / 225)} min read`;
  };

  if (loading && !isPreviewMode) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-950 to-gray-900">
        <Loader />
      </div>
    );
  }

  if ((error || !blog) && !isPreviewMode) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-950 to-gray-900">
        <div className="text-center p-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-2xl max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {error || "Blog not found."}
          </p>
        </div>
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
      {!isPreviewMode && (
        <button
          onClick={() => navigate(-1)}
          className="sticky top-6 left-6 z-40 flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-full shadow-lg hover:shadow-xl transition-all text-gray-700 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400"
        >
          <ArrowLeft size={20} />
          <span className="font-medium hidden sm:inline">Back</span>
        </button>
      )}

      <article className="max-w-5xl lg:max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 lg:p-12 border border-white/50 dark:border-gray-700/60 shadow-2xl mb-12"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black bg-gradient-to-r from-gray-900 to-indigo-900 dark:from-white dark:to-indigo-100 bg-clip-text text-transparent leading-tight mb-6">
            {blog.title}
          </h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
              {blog.author?.avatarUrl ? (
                <img
                  src={blog.author.avatarUrl}
                  alt=""
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <User size={24} className="text-white" />
              )}
            </div>
            <div>
              <p className="font-bold text-lg text-gray-900 dark:text-white">
                {blog.author?.fullName || blog.author?.username || "You"}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Calendar size={14} />
                {formatDate(blog.publishedAt || blog.createdAt)} · {readTime()}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-gray-600 dark:text-gray-400 border-t pt-4">
            <div className="flex items-center gap-2">
              <Eye size={16} />
              <span>{blog.views || 0} views</span>
            </div>
            <div className="flex items-center gap-2">
              <Heart size={16} />
              <span>{likeCount} likes</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle size={16} />
              <span>{blog.commentsCount || 0} comments</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl rounded-3xl p-6 sm:p-8 lg:p-12 border border-white/50 dark:border-gray-700/60 shadow-2xl"
        >
          {blog.featuredImage && (
            <img
              src={blog.featuredImage}
              alt={blog.title}
              className="w-full h-64 sm:h-80 md:h-96 lg:h-[520px] 2xl:h-[600px] object-cover rounded-3xl shadow-2xl mb-12"
            />
          )}

          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={{
              code: CodeBlock,
              h1: ({ children }) => <Heading level={1}>{children}</Heading>,
              h2: ({ children }) => <Heading level={2}>{children}</Heading>,
              h3: ({ children }) => <Heading level={3}>{children}</Heading>,
              h4: ({ children }) => <Heading level={4}>{children}</Heading>,
              h5: ({ children }) => <Heading level={5}>{children}</Heading>,
              h6: ({ children }) => <Heading level={6}>{children}</Heading>,
              p: Paragraph,
              ul: ({ children }) => <List ordered={false}>{children}</List>,
              ol: ({ children }) => <List ordered>{children}</List>,
              li: ListItem,
              blockquote: Blockquote,
              table: Table,
              thead: TableHead,
              tbody: TableBody,
              tr: TableRow,
              td: TableCell,
              th: TableHeaderCell,
              hr: () => <hr className="my-12 border-t border-gray-200 dark:border-gray-700" />,
            }}
          >
            {blog.content}
          </ReactMarkdown>
        </motion.div>

        {!isPreviewMode && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-16 flex flex-wrap justify-center gap-4 max-w-md mx-auto"
          >
            <button
              onClick={handleLike}
              className={clsx(
                "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-base shadow-lg hover:shadow-xl transition-all min-w-[140px]",
                liked
                  ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                  : "bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 backdrop-blur-xl"
              )}
            >
              <Heart size={18} className={liked ? "fill-current" : ""} />
              <span className="hidden sm:inline">Like</span>
              <span className="sm:hidden">({likeCount})</span>
              <span className="hidden sm:inline">({likeCount})</span>
            </button>

            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-base bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all min-w-[140px]"
            >
              <Share2 size={18} />
              <span>Share</span>
            </button>
          </motion.div>
        )}

        {!isPreviewMode && (
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-20"
          >
            <CommentSection
              parentType="Blog"
              parentId={blog._id}
              parentSlug={slug}
            />
          </motion.div>
        )}
      </article>
    </motion.div>
  );
};

export default BlogDetail;