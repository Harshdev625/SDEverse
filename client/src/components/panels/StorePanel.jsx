import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMyGroups,
  createGroup,
  fetchGroup,
  addLink,
  updateLink,
  removeLink,
  removeGroup,
  share,
} from '../../features/linkGroup/linkGroupSlice';
import {
  Loader2,
  Search,
  PlusCircle,
  Folder,
  FolderOpen,
  Link2,
  Trash2,
  Share2,
  Eye,
  EyeOff,
  Edit3,
  Save,
  ExternalLink,
  X,
  Plus,
} from 'lucide-react';
import Pagination from '../../pages/shared/Pagination';
import { motion as Motion, AnimatePresence } from 'framer-motion';

export default function StorePanel({ initialPage = 1 }) {
  const dispatch = useDispatch();
  const { groups = [], loading, total = 0, pages = 0 } = useSelector((state) => state.linkGroup || {});

  const [page, setPage] = useState(initialPage);
  const limit = 12;
  const [search, setSearch] = useState('');

  // Create group form
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [privacy, setPrivacy] = useState('private');

  // per-group add link
  const [addingTo, setAddingTo] = useState(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');

  useEffect(() => {
    dispatch(fetchMyGroups({ page, limit, q: search || '' }));
  }, [dispatch, page, search]);

  const [openGroupId, setOpenGroupId] = useState(null);
  const groupDetail = useSelector((state) => state.linkGroup.group);

  // inline link edit state
  const [editingLinkId, setEditingLinkId] = useState(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [editingUrlState, setEditingUrlState] = useState('');

  // small helper to get domain and favicon
  const domainFrom = (url) => {
    try {
      const u = new URL(url);
      return u.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const faviconFor = (url) => {
    try {
      const hostname = new URL(url).hostname;
      return `https://s2.googleusercontent.com/s2/favicons?domain=${hostname}`;
    } catch {
      return '';
    }
  };

  const handleCreate = async () => {
    if (!name.trim()) return alert('Name is required');
    try {
      await dispatch(createGroup({ name: name.trim(), description, privacy })).unwrap();
      setName('');
      setDescription('');
      setPrivacy('private');
      setCreating(false);
      dispatch(fetchMyGroups({ page, limit, q: search || '' }));
    } catch (err) {
      console.error('Failed to create group', err);
      alert(err?.message || 'Failed to create');
    }
  };

  const handleAddLink = async (groupId) => {
    if (!linkUrl.trim()) return alert('URL is required');
    try {
      await dispatch(addLink({ groupId, data: { url: linkUrl.trim(), title: linkTitle.trim() } })).unwrap();
      setAddingTo(null);
      setLinkUrl('');
      setLinkTitle('');
      dispatch(fetchGroup(groupId));
      dispatch(fetchMyGroups({ page, limit, q: search || '' }));
    } catch (err) {
      console.error('Failed to add link', err);
      alert(err?.message || 'Failed to add link');
    }
  };

  const handleDeleteGroup = async (id) => {
    if (!window.confirm('Delete this group?')) return;
    try {
      await dispatch(removeGroup(id)).unwrap();
      dispatch(fetchMyGroups({ page, limit, q: search || '' }));
    } catch (err) {
      console.error('Failed to delete group', err);
    }
  };

  const handleShare = async (groupId) => {
    const email = window.prompt('Enter email to share with:');
    if (!email) return;
    try {
      await dispatch(share({ groupId, data: { email } })).unwrap();
      dispatch(fetchMyGroups({ page, limit, q: search || '' }));
    } catch (err) {
      console.error('Failed to share', err);
      alert(err?.message || 'Failed to share');
    }
  };

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl shadow-lg border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Folder className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Store</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">{total} {total === 1 ? 'group' : 'groups'}</p>
          </div>
        </div>

        <button
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-medium text-sm shadow-sm hover:shadow-md"
          onClick={() => setCreating((c) => !c)}
          aria-expanded={creating}
        >
          <PlusCircle className="w-4 h-4" />
          <span>Create Group</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="relative sm:col-span-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search groups..."
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition-all text-sm"
          />
        </div>
      </div>

      {creating && (
        <Motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800"
        >
          <div className="grid grid-cols-1 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Group Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Interview Resources"
                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description (optional)</label>
              <input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description of this group"
                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition-all text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Privacy</label>
              <select
                value={privacy}
                onChange={(e) => setPrivacy(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition-all text-sm cursor-pointer"
              >
                <option value="private">Private</option>
                <option value="unlisted">Unlisted</option>
                <option value="public">Public</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleCreate}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium text-sm transition-all"
            >
              Create
            </button>
            <button
              onClick={() => {
                setCreating(false);
                setName('');
                setDescription('');
                setPrivacy('private');
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg font-medium text-sm transition-all"
            >
              Cancel
            </button>
          </div>
        </Motion.div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-600 dark:text-gray-400">
          <Loader2 className="animate-spin text-indigo-500 w-10 h-10" />
          <span className="text-sm font-medium">Loading groups...</span>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            {groups.length === 0 ? (
              <Motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-12"
              >
                <div className="inline-block p-3 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
                  <Folder className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">No groups yet</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {search
                    ? 'Try adjusting your search'
                    : 'Create a group to organize your links'}
                </p>
              </Motion.div>
            ) : (
              <Motion.div key="groups" className="mb-4 space-y-3">
                {groups.map((g) => (
                  <Motion.div
                    key={g._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-500 transition-all"
                  >
                    {/* Group Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                          {openGroupId === g._id ? (
                            <FolderOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          ) : (
                            <Folder className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-sm text-gray-900 dark:text-white truncate">
                            {g.name}
                          </h3>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(g.links || []).length} {(g.links || []).length === 1 ? 'link' : 'links'} • {g.privacy}
                          </p>
                          {g.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-1">
                              {g.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setAddingTo(g._id === addingTo ? null : g._id)}
                          title="Add Link"
                          className="inline-flex items-center justify-center p-1.5 rounded-md bg-green-50 hover:bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 transition-all"
                        >
                          {addingTo === g._id ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={async () => {
                            if (openGroupId === g._id) {
                              setOpenGroupId(null);
                            } else {
                              setOpenGroupId(g._id);
                              try {
                                await dispatch(fetchGroup(g._id)).unwrap();
                              } catch (err) {
                                console.error('Failed to load group', err);
                              }
                            }
                          }}
                          title={openGroupId === g._id ? 'Hide Links' : 'View Links'}
                          className="inline-flex items-center justify-center p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400 transition-all"
                        >
                          {openGroupId === g._id ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleShare(g._id)}
                          title="Share Group"
                          className="inline-flex items-center justify-center p-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 transition-all"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteGroup(g._id)}
                          title="Delete Group"
                          className="inline-flex items-center justify-center p-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Add Link Form */}
                    <AnimatePresence>
                      {addingTo === g._id && (
                        <Motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mb-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
                        >
                          <div className="space-y-2">
                            <input
                              value={linkUrl}
                              onChange={(e) => setLinkUrl(e.target.value)}
                              placeholder="https://example.com"
                              className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none text-sm"
                            />
                            <input
                              value={linkTitle}
                              onChange={(e) => setLinkTitle(e.target.value)}
                              placeholder="Link title (optional)"
                              className="w-full p-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none text-sm"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleAddLink(g._id)}
                                className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-all"
                              >
                                Add Link
                              </button>
                              <button
                                onClick={() => {
                                  setAddingTo(null);
                                  setLinkUrl('');
                                  setLinkTitle('');
                                }}
                                className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition-all"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </Motion.div>
                      )}
                    </AnimatePresence>

                    {/* Links List */}
                    <AnimatePresence>
                      {openGroupId === g._id && (
                        <Motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700"
                        >
                          {((groupDetail && groupDetail._id === g._id ? groupDetail : g).links || []).length === 0 ? (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-3">
                              No links yet. Click + to add one.
                            </p>
                          ) : (
                            ((groupDetail && groupDetail._id === g._id ? groupDetail : g).links || []).map((ln) => (
                              <Motion.div
                                key={ln._id}
                                layout
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
                              >
                                {editingLinkId === ln._id ? (
                                  <>
                                    <div className="flex-1 space-y-2">
                                      <input
                                        value={editingTitle}
                                        onChange={(e) => setEditingTitle(e.target.value)}
                                        placeholder="Title"
                                        className="w-full p-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                                      />
                                      <input
                                        value={editingUrlState}
                                        onChange={(e) => setEditingUrlState(e.target.value)}
                                        placeholder="URL"
                                        className="w-full p-1.5 rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm"
                                      />
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <button
                                        onClick={async () => {
                                          try {
                                            await dispatch(
                                              updateLink({
                                                groupId: g._id,
                                                linkId: ln._id,
                                                data: { title: editingTitle, url: editingUrlState },
                                              })
                                            ).unwrap();
                                            setEditingLinkId(null);
                                            setEditingTitle('');
                                            setEditingUrlState('');
                                            dispatch(fetchGroup(g._id));
                                          } catch (err) {
                                            console.error('Failed to update link', err);
                                            alert(err?.message || 'Failed to update link');
                                          }
                                        }}
                                        className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded text-sm"
                                      >
                                        <Save className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={() => {
                                          setEditingLinkId(null);
                                          setEditingTitle('');
                                          setEditingUrlState('');
                                        }}
                                        className="p-1.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-sm"
                                      >
                                        <X className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2 flex-1 min-w-0">
                                      <Link2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                      <img
                                        src={faviconFor(ln.url)}
                                        alt=""
                                        className="w-4 h-4 rounded flex-shrink-0"
                                        onError={(e) => {
                                          e.target.style.display = 'none';
                                        }}
                                      />
                                      <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                          {ln.title || ln.url}
                                        </div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                          {domainFrom(ln.url)}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                      <a
                                        href={ln.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        title="Open Link"
                                        className="inline-flex items-center justify-center p-1.5 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 transition-all"
                                      >
                                        <ExternalLink className="w-3.5 h-3.5" />
                                      </a>
                                      <button
                                        onClick={() => {
                                          setEditingLinkId(ln._id);
                                          setEditingTitle(ln.title || '');
                                          setEditingUrlState(ln.url || '');
                                        }}
                                        title="Edit Link"
                                        className="inline-flex items-center justify-center p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400 transition-all"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      <button
                                        onClick={async () => {
                                          if (!window.confirm('Remove this link?')) return;
                                          try {
                                            await dispatch(removeLink({ groupId: g._id, linkId: ln._id })).unwrap();
                                            dispatch(fetchGroup(g._id));
                                          } catch (err) {
                                            console.error('Failed to remove link', err);
                                          }
                                        }}
                                        title="Delete Link"
                                        className="inline-flex items-center justify-center p-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 transition-all"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  </>
                                )}
                              </Motion.div>
                            ))
                          )}
                        </Motion.div>
                      )}
                    </AnimatePresence>
                  </Motion.div>
                ))}
              </Motion.div>
            )}
          </AnimatePresence>

          {groups.length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Pagination
                currentPage={page}
                totalPages={pages || Math.max(1, Math.ceil(total / limit))}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </>
      )}
    </Motion.div>
  );
}
