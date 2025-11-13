import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { BookMarked, Bookmark, FileText, ArrowUp, Wrench, Sparkles, X } from 'lucide-react';
import { toast } from 'react-toastify';
import { fetchBookmarkByParent, addBookmark, removeBookmark } from '../features/bookmark/bookmarkSlice';
import { fetchNoteByParent } from '../features/note/noteSlice';

const QuickActions = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useSelector((s) => s.auth || {});
  const algorithmState = useSelector((s) => s.algorithm || {});
  const dataStructureState = useSelector((s) => s.dataStructure || {});
  const blogState = useSelector((s) => s.blog || {});

  const [parentType, setParentType] = useState('');
  const [parentId, setParentId] = useState(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasNote, setHasNote] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const path = location.pathname;
    if (path.startsWith('/algorithms/')) {
      setParentType('Algorithm');
      setParentId(algorithmState.algorithm?._id || null);
    } else if (path.startsWith('/data-structures/')) {
      setParentType('DataStructure');
      setParentId(dataStructureState.dataStructure?._id || null);
    } else if (path.startsWith('/blogs/')) {
      setParentType('Blog');
      setParentId(blogState.currentBlog?._id || null);
    } else {
      setParentType('');
      setParentId(null);
    }
  }, [location.pathname, algorithmState.algorithm, dataStructureState.dataStructure, blogState.currentBlog]);

  useEffect(() => {
    let mounted = true;
    const fetchStates = async () => {
      if (!parentType || !parentId) return;
      setLoading(true);
      try {
        const bm = await dispatch(fetchBookmarkByParent({ parentType, parentId })).unwrap().catch(() => null);
        if (mounted) setIsBookmarked(Boolean(bm && bm._id));
        const note = await dispatch(fetchNoteByParent({ parentType, parentId })).unwrap().catch(() => null);
        if (mounted) setHasNote(Boolean(note && note._id));
      } catch (e) {
        void e;
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchStates();
    return () => { mounted = false; };
  }, [parentType, parentId, dispatch]);

  // Close when clicking outside or pressing Escape
  useEffect(() => {
    const onDocClick = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('click', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const ensureAuth = () => {
    if (!user) {
      toast.info('Please log in to perform this action');
      navigate('/login');
      return false;
    }
    return true;
  };

  const toggleBookmark = async () => {
    if (!ensureAuth()) return;
    if (!parentType || !parentId) {
      toast.info('Bookmark is only available on detail pages');
      return;
    }
    try {
      setLoading(true);
      if (isBookmarked) {
        await dispatch(removeBookmark({ parentType, parentId })).unwrap();
        setIsBookmarked(false);
        toast.success('Bookmark removed');
      } else {
        await dispatch(addBookmark({ parentType, parentId })).unwrap();
        setIsBookmarked(true);
        toast.success('Bookmarked');
      }
    } catch (err) {
      toast.error(err?.message || 'Could not update bookmark');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const openNotes = () => {
    if (!parentType || !parentId) {
      toast.info('Notes panel not available on this page');
      setOpen(false);
      return;
    }
    window.dispatchEvent(new CustomEvent('sdeverse:open-note-editor', { detail: { parentType, parentId } }));
    setOpen(false);
  };

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setOpen(false);
  };

  const handleContribute = () => {
    if (!ensureAuth()) return;
    if (!parentType) {
      toast.info('Contribute is available on detail pages');
      return;
    }
    if (parentType === 'Algorithm') {
      const slug = algorithmState.algorithm?.slug;
      if (slug) navigate(`/algorithms/${slug}/contribute`);
    } else if (parentType === 'DataStructure') {
      const slug = dataStructureState.dataStructure?.slug;
      if (slug) navigate(`/data-structures/proposals/${slug}/edit`);
    } else if (parentType === 'Blog') {
      const slug = blogState.currentBlog?.slug;
      if (slug) navigate(`/blogs/${slug}/edit`);
    }
    setOpen(false);
  };

  // Main button always visible (on routes where Layout mounts this component). Actions disabled when no parent
  const isDetail = Boolean(parentType && parentId);
  const visible = {
    // Notes should not be shown for Blog pages per request
    notes: isDetail && parentType !== 'Blog',
    bookmark: isDetail,
    // Contribute only for Algorithm/DataStructure (not Blog)
    contribute: isDetail && ['Algorithm', 'DataStructure'].includes(parentType),
    scroll: true,
  };

  return (
    <div ref={rootRef} className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 z-50">
      {/* Action panel */}
      <div className={`flex flex-col items-end gap-3 mb-3 transition-all ${open ? 'opacity-100 translate-y-0' : 'opacity-0 pointer-events-none -translate-y-2'}`}>
        {visible.notes && (
          <button
            onClick={(e) => { e.stopPropagation(); openNotes(); }}
            title="Open notes"
            aria-label="Quick open notes"
            className={`w-12 h-12 p-2 rounded-full shadow-lg flex items-center justify-center transform transition-all ${hasNote ? 'ring-2 ring-emerald-400' : ''} bg-emerald-500 text-white`}
          >
            <FileText size={18} />
          </button>
        )}

        {visible.bookmark && (
          <button
            onClick={(e) => { e.stopPropagation(); toggleBookmark(); }}
            title="Toggle bookmark"
            aria-label="Quick toggle bookmark"
            disabled={loading}
            className={`w-12 h-12 p-2 rounded-full shadow-lg flex items-center justify-center transition-transform disabled:opacity-60 ${isBookmarked ? 'bg-yellow-400 text-white' : 'bg-yellow-100 text-yellow-800'}`}
          >
            {isBookmarked ? <BookMarked size={18} /> : <Bookmark size={18} />}
          </button>
        )}

        {visible.scroll && (
          <button
            onClick={(e) => { e.stopPropagation(); scrollTop(); }}
            title="Scroll to top"
            aria-label="Quick scroll to top"
            className="w-12 h-12 p-2 rounded-full bg-blue-600 text-white shadow-lg flex items-center justify-center"
          >
            <ArrowUp size={18} />
          </button>
        )}

        {visible.contribute && (
          <button
            onClick={(e) => { e.stopPropagation(); handleContribute(); }}
            title="Contribute"
            aria-label="Quick contribute"
            className="w-12 h-12 p-2 rounded-full bg-purple-600 text-white shadow-lg flex items-center justify-center"
          >
            <Sparkles size={18} />
          </button>
        )}
      </div>

      {/* Main FAB */}
      <div className="relative">
        <button
          onClick={(e) => { e.stopPropagation(); setOpen(o => !o); }}
          aria-expanded={open}
          aria-label={open ? 'Close quick actions' : 'Open quick actions'}
          className="w-12 h-12 p-2 rounded-full bg-gradient-to-br from-indigo-600 to-blue-600 text-white shadow-2xl flex items-center justify-center transform transition-transform hover:scale-105 focus:outline-none"
        >
          {!open ? (
            <Wrench size={18} />
          ) : (
            <X size={18} />
          )}
        </button>
        {/* small status badges */}
        {isBookmarked && <span className="absolute -top-1 -right-1 inline-flex h-3 w-3 rounded-full bg-yellow-400 ring-2 ring-white" />}
        {hasNote && <span className="absolute -bottom-1 -right-1 inline-flex h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-white" />}
      </div>
    </div>
  );
};

export default QuickActions;
