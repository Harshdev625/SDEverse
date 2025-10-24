import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createComment,
  fetchCommentsByParent,
  replyToComment,
  removeComment,
} from "../features/comment/commentSlice";
import { useSearchParams } from "react-router-dom";
import { Send, Trash2, X } from "lucide-react";
import { Link } from "react-router-dom";
import sdeverseIcon from "../assets/sdeverse.png";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";
import { toast } from "react-toastify";
import { formatDistanceToNow } from "date-fns";
import MentionInput from "../components/MentionInput";

export const MarkdownRenderer = ({ children }) => {
  // Process text to convert @mentions to markdown links, but disable @sdeverse links
  const processedText = String(children).replace(
    /@([a-zA-Z0-9_]+)/g,
    (match, username) => {
      if (username === 'sdeverse') {
        return '@sdeverse'; // Keep as plain text, no link
      }
      return `[@${username}](/profile/${username})`;
    }
  );

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[rehypeKatex]}
      components={{
        code({ inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          return !inline && match ? (
            <SyntaxHighlighter
              style={oneDark}
              language={match[1]}
              PreTag="div"
              {...props}
            >
              {String(children).replace(/\n$/, "")}
            </SyntaxHighlighter>
          ) : (
            <code
              className="bg-gray-200 dark:bg-gray-700 rounded px-1.5 py-0.5 font-mono text-sm"
              {...props}
            >
              {children}
            </code>
          );
        },
        a({ href, children, ...props }) {
          // Style mention links differently
          const isMention = href?.startsWith('/profile/');
          return (
            <a
              href={href}
              className={isMention ? "text-blue-500 hover:underline font-medium" : "text-blue-600 hover:underline"}
              {...props}
            >
              {children}
            </a>
          );
        },
      }}
    >
      {processedText}
    </ReactMarkdown>
  );
};

const ReplyInput = ({ initialText = "", onCancel, onSubmit }) => {
  const [text, setText] = useState(initialText);

  const handleSubmit = () => {
    if (text.trim().length === 0) return;
    onSubmit(text.trim());
    setText("");
  };

  return (
    <div className="relative w-full mt-4 flex flex-col space-y-3">
      <MentionInput
        value={text}
        onChange={setText}
        placeholder="Write a reply..."
        rows={2}
        className="text-sm"
      />
      <div className="flex space-x-1.5 justify-end">
        <button
          onClick={handleSubmit}
          disabled={text.trim().length === 0}
          className={`px-3 py-2 rounded-lg text-white text-sm font-medium transition ${
            text.trim()
              ? "bg-blue-600 hover:bg-blue-700"
              : "bg-blue-300 cursor-not-allowed"
          }`}
          aria-label="Send reply"
        >
          <Send size={16} />
        </button>
        <button
          onClick={onCancel}
          className="px-3 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
          aria-label="Cancel reply"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

const CommentSection = ({ parentType, parentId, parentSlug }) => {
  const dispatch = useDispatch();
  const { comments, loading } = useSelector((state) => state.comment);
  const currentUser = useSelector((state) => state.auth.user);
  const [newCommentText, setNewCommentText] = useState("");
  const [replyOpenFor, setReplyOpenFor] = useState(null);
  const [searchParams] = useSearchParams();

  useEffect(() => {
    dispatch(fetchCommentsByParent({ parentType, parentId }));
  }, [dispatch, parentType, parentId]);

  useEffect(() => {
    if (!loading) {
      const commentId = searchParams.get("commentId");
      if (commentId) {
        const element = document.getElementById(`comment-${commentId}`);
        if (element) {
          const headerOffset = 70; // Adjusted for the 14px header height + some buffer
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }
    }
  }, [loading, searchParams]);

  const handleNewCommentSubmit = async () => {
    if (!newCommentText.trim()) return;
    try {
      await dispatch(
        createComment({
          parentType,
          parentId,
          parentSlug,
          text: newCommentText,
        })
      ).unwrap();
      toast.success("Comment posted!");
      setNewCommentText("");
      await dispatch(fetchCommentsByParent({ parentType, parentId }));
    } catch {
      toast.error("Failed to post comment.");
    }
  };

  const handleReplySubmit = async (commentId, replyText) => {
    try {
      await dispatch(
        replyToComment({ commentId, replyData: { text: replyText } })
      ).unwrap();
      toast.success("Reply posted!");
      setReplyOpenFor(null);
      await dispatch(fetchCommentsByParent({ parentType, parentId }));
    } catch {
      toast.error("Failed to post reply.");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;
    try {
      await dispatch(removeComment(id)).unwrap();
      toast.success("Comment deleted!");
      await dispatch(fetchCommentsByParent({ parentType, parentId }));
    } catch {
      toast.error("Failed to delete comment.");
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
      <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-8 select-none">
        Discussion
      </h2>

      <div className="flex flex-col gap-3 mb-6">
        <MentionInput
          value={newCommentText}
          onChange={setNewCommentText}
          placeholder="Leave a comment..."
          rows={4}
        />
        <div className="flex justify-end">
          <button
            onClick={handleNewCommentSubmit}
            disabled={!newCommentText.trim()}
            className={`flex items-center justify-center gap-1 rounded-md px-5 py-3 text-white text-base transition ${
              newCommentText.trim()
                ? "bg-blue-600 hover:bg-blue-700"
                : "bg-blue-300 cursor-not-allowed"
            }`}
            aria-label="Submit comment"
            title="Post comment"
          >
            Post <Send size={18} />
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500 dark:text-gray-400">Loading comments...</p>
      ) : comments.length === 0 ? (
        <p className="text-gray-700 dark:text-gray-400">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <ul className="space-y-8">
          {comments.map((comment) => {
            const isReplyOpen = replyOpenFor === comment._id;
            return (
              <li
                id={`comment-${comment._id}`}
                key={comment._id}
                className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-inner border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    {comment.user.displayUsername === 'sdeverse' ? (
                      <div className="relative">
                        <img
                          src={sdeverseIcon}
                          alt="sdeverse"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">S</span>
                        </div>
                      </div>
                    ) : (
                      <Link to={`/profile/${comment.user.displayUsername || comment.user.username}`}>
                        <img
                          src={comment.user.avatarUrl || "/default-avatar.png"}
                          alt={comment.user.displayUsername || comment.user.username}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </Link>
                    )}
                    <div className="flex flex-col sm:flex-row sm:items-center">
                      {comment.user.displayUsername === 'sdeverse' ? (
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {comment.user.displayUsername || comment.user.username}
                        </span>
                      ) : (
                        <Link
                          to={`/profile/${comment.user.displayUsername || comment.user.username}`}
                          className="font-semibold text-gray-900 dark:text-white hover:underline"
                        >
                          {comment.user.displayUsername || comment.user.username}
                        </Link>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 sm:ml-3">
                        {formatDistanceToNow(new Date(comment.createdAt), {
                          addSuffix: true,
                        })}
                      </span>
                    </div>
                  </div>
                  {currentUser?._id === comment.user._id && (
                    <button
                      onClick={() => handleDelete(comment._id)}
                      className="p-1.5 rounded-md hover:bg-red-600 hover:text-white transition text-red-600"
                      aria-label="Delete comment"
                      title="Delete comment"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>

                <div className="prose prose-sm dark:prose-invert max-w-none mb-4">
                  <MarkdownRenderer>{comment.text}</MarkdownRenderer>
                </div>

                <button
                  onClick={() =>
                    setReplyOpenFor(isReplyOpen ? null : comment._id)
                  }
                  className="text-sm font-semibold text-blue-600 hover:underline focus:outline-none"
                  aria-expanded={isReplyOpen}
                >
                  {isReplyOpen ? "Cancel Reply" : "Reply"}
                </button>

                {isReplyOpen && (
                  <ReplyInput
                    initialText={`@${comment.user.displayUsername || comment.user.username} `}
                    onCancel={() => setReplyOpenFor(null)}
                    onSubmit={(text) => handleReplySubmit(comment._id, text)}
                  />
                )}

                {comment.replies?.length > 0 && (
                  <ul className="mt-6 pl-8 border-l border-gray-300 dark:border-gray-700 space-y-6">
                    {comment.replies.map((reply) => {
                      const isReplyOpen = replyOpenFor === reply._id;
                      return (
                        <li
                          id={`comment-${reply._id}`}
                          key={reply._id}
                          className="relative space-y-2 bg-gray-100 dark:bg-gray-800 p-4 rounded-lg shadow-inner"
                        >
                          <div className="flex items-center space-x-3 mb-1">
                            {reply.user.displayUsername === 'sdeverse' ? (
                              <div className="relative">
                                <img
                                  src={sdeverseIcon}
                                  alt="sdeverse"
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">S</span>
                                </div>
                              </div>
                            ) : (
                              <Link to={`/profile/${reply.user.displayUsername || reply.user.username}`}>
                                <img
                                  src={
                                    reply.user.avatarUrl || "/default-avatar.png"
                                  }
                                  alt={reply.user.displayUsername || reply.user.username}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              </Link>
                            )}
                            <div className="flex flex-col sm:flex-row sm:items-center">
                              {reply.user.displayUsername === 'sdeverse' ? (
                                <span className="font-semibold text-gray-900 dark:text-white text-sm">
                                  {reply.user.displayUsername || reply.user.username}
                                </span>
                              ) : (
                                <Link
                                  to={`/profile/${reply.user.displayUsername || reply.user.username}`}
                                  className="font-semibold text-gray-900 dark:text-white hover:underline text-sm"
                                >
                                  {reply.user.displayUsername || reply.user.username}
                                </Link>
                              )}
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 sm:ml-3">
                                {formatDistanceToNow(
                                  new Date(reply.createdAt),
                                  {
                                    addSuffix: true,
                                  }
                                )}
                              </span>
                            </div>
                            {reply.user &&
                              currentUser?._id === reply.user._id && (
                                <button
                                  onClick={() => handleDelete(reply._id)}
                                  className="ml-auto p-1 rounded-md hover:bg-red-600 hover:text-white transition text-red-600"
                                  aria-label="Delete reply"
                                  title="Delete reply"
                                >
                                  <Trash2 size={16} />
                                </button>
                              )}
                          </div>

                          <div className="prose prose-sm dark:prose-invert max-w-none text-sm">
                            <MarkdownRenderer>{reply.text}</MarkdownRenderer>
                          </div>

                          <button
                            onClick={() =>
                              setReplyOpenFor(isReplyOpen ? null : reply._id)
                            }
                            className="text-xs font-medium text-blue-600 hover:underline mt-1"
                            aria-expanded={isReplyOpen}
                          >
                            {isReplyOpen ? "Cancel Reply" : "Reply"}
                          </button>

                          {isReplyOpen && (
                            <ReplyInput
                              initialText={`@${reply.user.displayUsername || reply.user.username} `}
                              onCancel={() => setReplyOpenFor(null)}
                              onSubmit={(text) =>
                                handleReplySubmit(reply._id, text)
                              }
                            />
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default CommentSection;