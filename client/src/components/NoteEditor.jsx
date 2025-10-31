import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FileText, X, Save, Trash, Code, Eye, Plus, Pencil, GripVertical
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeKatex from 'rehype-katex';
import {
  fetchNoteByParent, saveNote, removeNote, clearNote
} from '../features/note/noteSlice';

// --- Imports for UI & Animation ---
import { motion, AnimatePresence } from 'framer-motion';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import Editor from '@monaco-editor/react';
import clsx from 'clsx'; // Make sure you have clsx: npm install clsx

// --- Segmented Control (Unchanged) ---
const EditorToggle = ({ isPreview, onToggle }) => (
  <div className="flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
    <button
      onClick={() => onToggle(false)}
      className={`flex items-center gap-1.5 px-3 py-1 text-sm rounded-md ${
        !isPreview
          ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
          : 'text-gray-500 dark:text-gray-400'
      } transition-all`}
    >
      <Code size={14} /> Write
    </button>
    <button
      onClick={() => onToggle(true)}
      className={`flex items-center gap-1.5 px-3 py-1 text-sm rounded-md ${
        isPreview
          ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white'
          : 'text-gray-500 dark:text-gray-400'
      } transition-all`}
    >
      <Eye size={14} /> Preview
    </button>
  </div>
);

const NoteEditor = ({ parentType, parentId }) => {
  const dispatch = useDispatch();
  const { note, loading } = useSelector((state) => state.note || {});
  const { mode: themeMode } = useSelector((state) => state.theme);
  const darkMode = themeMode === 'dark';

  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [preview, setPreview] = useState(true);

  // --- Resizable Drawer State ---
  const [width, setWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);

  // --- Theme-Aware CodeBlock ---
  const CodeBlock = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <SyntaxHighlighter
          style={darkMode ? vscDarkPlus : prism}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, '')}
        </SyntaxHighlighter>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
  };

  // --- Data Fetching (Unchanged) ---
  useEffect(() => {
    if (parentType && parentId) {
      dispatch(fetchNoteByParent({ parentType, parentId }))
        .unwrap()
        .then((payload) => {
          const noteContent = payload?.content || '';
          setContent((c) => (c ? c : noteContent));
          setOriginalContent(noteContent);
        })
        .catch(() => {});
    }
  }, [dispatch, parentType, parentId]);

  useEffect(() => {
    if (open && parentType && parentId) {
      setPreview(true);
      dispatch(fetchNoteByParent({ parentType, parentId }))
        .unwrap()
        .then((payload) => {
          const noteContent = payload?.content || '';
          setContent(noteContent);
          setOriginalContent(noteContent);
        })
        .catch(() => {});
    }
  }, [open, dispatch, parentType, parentId]);

  // --- Handlers (Unchanged) ---
  const handleSave = async () => {
    try {
      await dispatch(saveNote({ parentType, parentId, content })).unwrap();
      setOriginalContent(content);
      setPreview(true);
    } catch (err) {
      console.error('Error saving note', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await dispatch(removeNote({ parentType, parentId }));
      setContent('');
      setOriginalContent('');
      setPreview(true);
      dispatch(clearNote());
    } catch (err) {
      console.error('Error deleting note', err);
    }
  };

  const handleCancel = () => {
    setContent(originalContent);
    setPreview(true);
  };

  // --- Resizing Logic ---
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };
  const handleMouseUp = useCallback(() => setIsResizing(false), []);
  const handleMouseMove = useCallback(
    (e) => {
      if (!isResizing) return;
      const newWidth = Math.min(
        Math.max(window.innerWidth - e.clientX, 300),
        1000
      );
      setWidth(newWidth);
    },
    [isResizing]
  );
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);
  // --- End Resizing Logic ---

  const hasNote = Boolean(note && note._id);

  // --- Main Content Renderer ---
  const renderContent = (isMobile = false) => {
    if (loading) {
      return <div className="text-sm text-gray-500 p-4">Loading...</div>;
    }

    if (preview) {
      return (
        <div className={clsx("p-4", !isMobile && "h-full")}>
          {content ? (
            <div className="prose max-w-none dark:prose-invert">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeKatex]}
                components={CodeBlock}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 py-10">
              <FileText size={48} className="mb-4 opacity-50" />
              <h4 className="font-semibold text-lg text-gray-700 dark:text-gray-200 mb-2">
                No notes yet
              </h4>
              <p className="text-sm mb-6">Add a private note to this page.</p>
              <button
                onClick={() => setPreview(false)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-all"
              >
                <Plus size={18} /> Add Note
              </button>
            </div>
          )}
        </div>
      );
    }

    // --- Editor View ---
    return (
      <div className={clsx(
        "border-gray-200 dark:border-gray-800",
        isMobile ? "w-full h-[60vh] rounded-md border" : "h-full"
      )}>
        <Editor
          height="100%"
          language="markdown"
          theme={darkMode ? 'vs-dark' : 'light'}
          value={content}
          onChange={(value) => setContent(value || '')}
          options={{
            minimap: { enabled: false },
            wordWrap: 'on',
            lineNumbers: 'off',
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: 10,
            lineNumbersMinChars: 0,
            padding: { top: 16, bottom: 16 },
          }}
        />
      </div>
    );
  };

  // --- Footer Button Renderer (Unchanged) ---
  const renderFooter = () => {
    // ... (This function is identical to the previous version, so I am omitting it for brevity)
    // ... (Paste your existing renderFooter function here) ...
    if (preview) {
      if (!content) return null; // Hide footer in empty state
      return (
        <>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPreview(false)}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
            >
              <Pencil size={16} /> Edit
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
            >
              <Trash size={16} /> Delete
            </button>
          </div>
          <div className="text-xs text-gray-500">Notes are private</div>
        </>
      );
    }
    // --- Editor Footer ---
    return (
      <>
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
          >
            <Save size={16} /> Save
          </button>
          <button
            onClick={handleCancel}
            className="inline-flex items-center gap-2 px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md"
          >
            <X size={16} /> Cancel
          </button>
        </div>
        {originalContent && (
          <button
            onClick={handleDelete}
            className="p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full"
            title="Delete Note"
          >
            <Trash size={16} />
          </button>
        )}
      </>
    );
  };

  return (
    <>
      {/* --- Floating Button (Animated) --- */}
      <motion.button
        aria-label="Open notes"
        title="Notes"
        onClick={() => setOpen(true)}
        className="fixed right-4 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-br from-indigo-600 to-blue-600 text-white p-3 rounded-full shadow-2xl focus:outline-none flex items-center justify-center"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <FileText size={18} />
        {hasNote && <span className="absolute -top-1 -right-1 inline-flex h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" aria-hidden="true" />}
      </motion.button>

      {/* --- Desktop Drawer (NEW ANIMATION) --- */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed right-0 top-0 h-full z-50 hidden md:block"
            style={{ width }} // Use the resizable width state
            initial={{ x: "100%" }}
            animate={{ x: "0%" }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            {/* --- MODERN Resizer Handle --- */}
            <div
              className={clsx(
                "absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-24 cursor-col-resize z-50 group flex items-center justify-center",
                isResizing && "z-50" // Ensure it's on top when dragging
              )}
              onMouseDown={handleMouseDown}
            >
              <div
                className={clsx(
                  "w-1.5 h-full rounded-full bg-gray-300 dark:bg-gray-700 transition-all",
                  "group-hover:bg-blue-500",
                  isResizing && "bg-blue-600 scale-110"
                )}
              />
            </div>
            
            {/* --- Glassmorphism Panel --- */}
            <div className="h-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-l border-gray-200 dark:border-gray-800 shadow-xl flex flex-col">
              <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Notes</h3>
                <div className="flex items-center gap-2">
                  <EditorToggle isPreview={preview} onToggle={setPreview} />
                  <button
                    onClick={() => setOpen(false)}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto">{renderContent(false)}</div>

              <div className="p-4 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 flex items-center justify-between gap-3">
                {renderFooter()}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- Mobile Modal (Animated & Fixed) --- */}
      <AnimatePresence>
        {open && (
          <div className="md:hidden fixed inset-0 z-50 flex items-end">
            <motion.div
              className="absolute inset-0 bg-black/40"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
            <motion.div
              className="relative w-full bg-white dark:bg-gray-900 rounded-t-2xl p-4 max-h-[85vh] flex flex-col" // Increased max-h
              initial={{ y: "100%" }}
              animate={{ y: "0%" }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex-shrink-0 flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold">Notes</h3>
                <div className="flex items-center gap-2">
                  <EditorToggle isPreview={preview} onToggle={setPreview} />
                  <button
                    onClick={() => setOpen(false)}
                    className="p-2 rounded-md"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>

              {/* --- Main Scrolling Area --- */}
              <div className="flex-1 overflow-y-auto">
                {renderContent(true)}
              </div>

              {/* --- Footer --- */}
              <div className="flex-shrink-0 mt-4 flex items-center justify-between">
                {renderFooter()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NoteEditor;