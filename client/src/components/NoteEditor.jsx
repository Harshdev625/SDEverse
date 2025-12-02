import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FileText, X, Save, Trash, Pencil, Eye, Plus, Sparkles,
  Bold, Italic, Link as LinkIcon, Image as ImageIcon, List, ListOrdered, 
  Quote, Hash, Code as CodeIcon
} from 'lucide-react';
import {
  fetchNoteByParent, saveNote, removeNote, clearNote
} from '../features/note/noteSlice';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import clsx from 'clsx';
import MarkdownRenderer from './MarkdownRenderer';

// Modern Segmented Control
const EditorToggle = ({ isPreview, onToggle }) => (
  <div className="relative flex items-center p-1 bg-gray-100/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-inner">
    <motion.div
      className="absolute top-1 bottom-1 bg-white dark:bg-gray-700 rounded-lg shadow-md"
      animate={{
        left: isPreview ? 'calc(50% - 2px)' : '4px',
        right: isPreview ? '4px' : 'calc(50% - 2px)',
      }}
      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
    />
    <button
      onClick={() => onToggle(false)}
      className={clsx(
        'relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200',
        !isPreview
          ? 'text-gray-900 dark:text-white'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
      )}
    >
      <Pencil size={16} />
      <span className="hidden sm:inline">Write</span>
    </button>
    <button
      onClick={() => onToggle(true)}
      className={clsx(
        'relative z-10 flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200',
        isPreview
          ? 'text-gray-900 dark:text-white'
          : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
      )}
    >
      <Eye size={16} />
      <span className="hidden sm:inline">Preview</span>
    </button>
  </div>
);

const NoteEditor = ({ parentType: propParentType = '', parentId: propParentId = null, showFloatingButton = true }) => {
  const dispatch = useDispatch();
  const { note, loading } = useSelector((state) => state.note || {});
  const { mode } = useSelector((state) => state.theme);
  const dark = mode === 'dark';

  const [currentParentType, setCurrentParentType] = useState(propParentType);
  const [currentParentId, setCurrentParentId] = useState(propParentId);
  const [open, setOpen] = useState(false);
  const [content, setContent] = useState('');
  const [originalContent, setOriginalContent] = useState('');
  const [preview, setPreview] = useState(true);

  const editorRef = React.useRef(null);

  // Data Fetching
  useEffect(() => {
    if (currentParentType && currentParentId) {
      dispatch(fetchNoteByParent({ parentType: currentParentType, parentId: currentParentId }))
        .unwrap()
        .then((payload) => {
          const noteContent = payload?.content || '';
          setContent((c) => (c ? c : noteContent));
          setOriginalContent(noteContent);
        })
        .catch(() => {});
    }
  }, [dispatch, currentParentType, currentParentId]);

  useEffect(() => {
    if (open && currentParentType && currentParentId) {
      dispatch(fetchNoteByParent({ parentType: currentParentType, parentId: currentParentId }))
        .unwrap()
        .then((payload) => {
          const noteContent = payload?.content || '';
          setContent(noteContent);
          setOriginalContent(noteContent);
        })
        .catch(() => {});
    }
  }, [open, dispatch, currentParentType, currentParentId]);

  // Handlers
  const handleSave = async () => {
    try {
      await dispatch(saveNote({ parentType: currentParentType, parentId: currentParentId, content })).unwrap();
      setOriginalContent(content);
      setPreview(true);
    } catch (err) {
      console.error('Error saving note', err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this note?")) return;
    try {
      await dispatch(removeNote({ parentType: currentParentType, parentId: currentParentId }));
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

  const handleEditorMount = (editor) => {
    editorRef.current = editor;
  };

  const hasNote = Boolean(note && note._id);

  // Listen for global open events
  useEffect(() => {
    const handler = (e) => {
      const detail = (e && e.detail) || {};
      const nextParentType = detail.parentType || propParentType || '';
      const nextParentId = detail.parentId || propParentId || null;
      if (nextParentType && nextParentId) {
        setCurrentParentType(nextParentType);
        setCurrentParentId(nextParentId);
        setPreview(true);
        setOpen(true);
      }
    };
    window.addEventListener('sdeverse:open-note-editor', handler);
    return () => window.removeEventListener('sdeverse:open-note-editor', handler);
  }, [propParentType, propParentId]);

  // Toolbar helpers
  const applyWrap = (prefix, suffix, placeholder) => {
    const ed = editorRef.current;
    if (!ed) return;
    const sel = ed.getSelection();
    const model = ed.getModel();
    const selected = model.getValueInRange(sel) || '';
    const insertText = `${prefix}${selected || placeholder}${suffix}`;
    ed.executeEdits('note-editor', [{ range: sel, text: insertText, forceMoveMarkers: true }]);
    setContent(model.getValue());
    ed.focus();
  };

  const applyLinePrefix = (prefix, placeholder) => {
    const ed = editorRef.current;
    if (!ed) return;
    const sel = ed.getSelection();
    const model = ed.getModel();
    const startLine = sel.startLineNumber;
    const endLine = sel.endLineNumber;
    const edits = [];
    for (let ln = startLine; ln <= endLine; ln += 1) {
      const lineContent = model.getLineContent(ln);
      if (!lineContent.trim()) {
        edits.push({ range: { startLineNumber: ln, startColumn: 1, endLineNumber: ln, endColumn: 1 }, text: prefix + placeholder + '\n' });
      } else {
        edits.push({ range: { startLineNumber: ln, startColumn: 1, endLineNumber: ln, endColumn: 1 }, text: prefix });
      }
    }
    ed.executeEdits('note-editor', edits);
    setContent(model.getValue());
    ed.focus();
  };

  // Content Renderer
  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-violet-600 border-t-transparent"></div>
        </div>
      );
    }

    if (preview) {
      if (!content) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center py-16">
              <motion.div
                className="mb-8 relative"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20 }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-400 via-fuchsia-400 to-pink-400 rounded-full blur-2xl opacity-30 animate-pulse" />
                <div className="relative p-8 rounded-3xl bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-900/20 dark:to-fuchsia-900/20 border border-violet-200 dark:border-violet-800">
                  <FileText size={64} className="text-violet-600 dark:text-violet-400" strokeWidth={1.5} />
                </div>
              </motion.div>
              
              <h4 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-3">
                Your canvas awaits
              </h4>
              <p className="text-base text-gray-600 dark:text-gray-400 mb-8 max-w-md">
                Start writing your notes, thoughts, and ideas. Everything is private and synced automatically.
              </p>
              
              <motion.button
                onClick={() => setPreview(false)}
                className="group relative inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 text-white rounded-xl font-semibold overflow-hidden shadow-xl shadow-violet-500/25 hover:shadow-2xl hover:shadow-violet-500/40 transition-all duration-300"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 opacity-0 group-hover:opacity-100 blur transition-opacity duration-300" />
                <Sparkles size={20} className="relative z-10" />
                <span className="relative z-10">Start Writing</span>
              </motion.button>
            </div>
        );
      }

      return <MarkdownRenderer content={content} className="p-8 h-full overflow-y-auto" />;
    }

    // Editor View
    return (
      <div className="h-full flex flex-col bg-white dark:bg-gray-900">
        {/* Modern Toolbar */}
        <div className="px-4 py-3 border-b border-gray-200/80 dark:border-gray-700/80 bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
          <div className="flex flex-wrap gap-2 items-center justify-center">
            {/* Text Formatting */}
            <div className="flex items-center gap-0.5 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-700/50">
              <button
                title="Bold"
                onClick={() => applyWrap('**', '**', 'bold text')}
                className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
              >
                <Bold size={16} />
              </button>
              <button
                title="Italic"
                onClick={() => applyWrap('*', '*', 'italic text')}
                className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
              >
                <Italic size={16} />
              </button>
              <button
                title="Inline Code"
                onClick={() => applyWrap('`', '`', 'code')}
                className="p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 transition-all"
              >
                <CodeIcon size={16} />
              </button>
            </div>

            {/* Headings */}
            <div className="flex items-center gap-0.5 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-700/50">
              <button
                title="Heading 1"
                onClick={() => applyLinePrefix('# ', 'Heading 1')}
                className="px-2.5 py-2 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400 transition-all text-xs font-bold"
              >
                H1
              </button>
              <button
                title="Heading 2"
                onClick={() => applyLinePrefix('## ', 'Heading 2')}
                className="px-2.5 py-2 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400 transition-all text-xs font-bold"
              >
                H2
              </button>
              <button
                title="Heading 3"
                onClick={() => applyLinePrefix('### ', 'Heading 3')}
                className="px-2.5 py-2 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:text-violet-600 dark:hover:text-violet-400 transition-all text-xs font-bold"
              >
                H3
              </button>
            </div>

            {/* Block Elements */}
            <div className="flex items-center gap-0.5 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-700/50">
              <button
                title="Quote"
                onClick={() => applyLinePrefix('> ', 'Quote')}
                className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
              >
                <Quote size={16} />
              </button>
              <button
                title="Code Block"
                onClick={() => applyWrap('```\n', '\n```', 'code')}
                className="p-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
              >
                <Hash size={16} />
              </button>
            </div>

            {/* Lists & Media */}
            <div className="flex items-center gap-0.5 bg-white dark:bg-gray-800 rounded-xl p-1 shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-700/50">
              <button
                title="Bullet List"
                onClick={() => applyLinePrefix('- ', 'List item')}
                className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400 transition-all"
              >
                <List size={16} />
              </button>
              <button
                title="Numbered List"
                onClick={() => applyLinePrefix('1. ', 'List item')}
                className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400 transition-all"
              >
                <ListOrdered size={16} />
              </button>
              <button
                title="Link"
                onClick={() => applyWrap('[', '](url)', 'text')}
                className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400 transition-all"
              >
                <LinkIcon size={16} />
              </button>
              <button
                title="Image"
                onClick={() => applyWrap('![', '](url)', 'alt')}
                className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 hover:text-amber-600 dark:hover:text-amber-400 transition-all"
              >
                <ImageIcon size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Editor */}
        <div className="flex-1 min-h-[450px]">
          <Editor
            height="100%"
            language="markdown"
            theme={dark ? 'vs-dark' : 'light'}
            value={content}
            onChange={(value) => setContent(value || '')}
            onMount={handleEditorMount}
            options={{
              minimap: { enabled: false },
              wordWrap: 'on',
              lineNumbers: 'on',
              glyphMargin: false,
              folding: true,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3,
              padding: { top: 20, bottom: 20 },
              fontSize: 15,
              lineHeight: 24,
              fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, monospace",
              scrollBeyondLastLine: false,
              smoothScrolling: true,
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
            }}
          />
        </div>
      </div>
    );
  };

  // Footer
  const renderFooter = () => {
    if (preview) {
      if (!content) return null;
      return (
        <>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => setPreview(false)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all"
              whileHover={{ scale: 1.02, y: -1, boxShadow: '0 20px 40px -10px rgba(59, 130, 246, 0.4)' }}
              whileTap={{ scale: 0.98 }}
            >
              <Pencil size={18} /> Edit
            </motion.button>
            <motion.button
              onClick={handleDelete}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold shadow-lg shadow-red-500/25 transition-all"
              whileHover={{ scale: 1.02, y: -1, boxShadow: '0 20px 40px -10px rgba(239, 68, 68, 0.4)' }}
              whileTap={{ scale: 0.98 }}
            >
              <Trash size={18} /> Delete
            </motion.button>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Private & Secured
          </div>
        </>
      );
    }
    return (
      <>
        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-semibold shadow-lg shadow-emerald-500/25 transition-all"
            whileHover={{ scale: 1.02, y: -1, boxShadow: '0 20px 40px -10px rgba(16, 185, 129, 0.4)' }}
            whileTap={{ scale: 0.98 }}
          >
            <Save size={18} /> Save
          </motion.button>
          <motion.button
            onClick={handleCancel}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl font-semibold shadow-sm transition-all"
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
          >
            <X size={18} /> Cancel
          </motion.button>
        </div>
        {originalContent && (
          <button
            onClick={handleDelete}
            className="p-2.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-xl transition-all"
            title="Delete"
          >
            <Trash size={18} />
          </button>
        )}
      </>
    );
  };

  return (
    <>
      {/* Floating Button */}
      {showFloatingButton && (
        <motion.button
          onClick={() => { setPreview(true); setOpen(true); }}
          className="fixed right-6 top-1/2 -translate-y-1/2 z-40 bg-gradient-to-br from-violet-600 via-fuchsia-600 to-pink-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-center"
          whileHover={{ scale: 1.1, rotate: 5 }}
          whileTap={{ scale: 0.95 }}
          animate={{ 
            boxShadow: hasNote 
              ? ['0 20px 60px -15px rgba(139, 92, 246, 0.5)', '0 20px 80px -15px rgba(217, 70, 239, 0.6)', '0 20px 60px -15px rgba(139, 92, 246, 0.5)']
              : '0 20px 60px -15px rgba(139, 92, 246, 0.5)'
          }}
          transition={{ 
            boxShadow: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
          }}
        >
          <FileText size={22} strokeWidth={2.5} />
          {hasNote && (
            <motion.span 
              className="absolute -top-1 -right-1 inline-flex h-4 w-4 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 ring-4 ring-white dark:ring-gray-900" 
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          )}
        </motion.button>
      )}

      {/* Modal */}
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              onClick={() => setOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal Card */}
            <motion.div
              className="relative w-full max-w-2xl sm:max-w-3xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-gray-200/50 dark:border-gray-700/50"
              style={{ height: 'min(88vh, 920px)' }}
              initial={{ scale: 0.9, y: 40, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 40, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200/80 dark:border-gray-700/80 flex items-center justify-between bg-gradient-to-r from-violet-50 via-fuchsia-50 to-pink-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-lg">
                    <FileText size={22} strokeWidth={2} />
                  </div>
                  <h3 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                    My Notes
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <EditorToggle isPreview={preview} onToggle={setPreview} />
                  <motion.button
                    onClick={() => setOpen(false)}
                    className="p-2 rounded-xl hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all"
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <X size={20} />
                  </motion.button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-auto bg-white dark:bg-gray-900">
                {renderContent()}
              </div>

              {/* Footer */}
              <div className="px-6 py-4 border-t border-gray-200/80 dark:border-gray-700/80 flex items-center justify-between gap-3 bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900">
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
