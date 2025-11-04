import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyNotes, removeNote } from '../features/note/noteSlice';
import { Loader2, Search, FileText, Filter, Link as LinkIcon, Trash2, Edit3 } from 'lucide-react';
import Pagination from './Pagination';
import { motion, AnimatePresence } from 'framer-motion';

export default function NotesPanel({ initialPage = 1 }) {
  const dispatch = useDispatch();
  const { notes = [], loading, total = 0, pages = 0 } = useSelector((state) => state.note || {});

  const [page, setPage] = useState(initialPage);
  const limit = 12;
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    const parentType = filterType === 'all' ? '' : filterType;
    dispatch(fetchMyNotes({ page, limit, q: search || '', parentType }));
  }, [dispatch, page, search, filterType]);

  const displayed = notes || [];
  const noteTypes = ['all', 'Algorithm', 'DataStructure', 'Blog'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-lg shadow border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 p-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600 rounded-lg">
            <FileText className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">My Notes</div>
            <div className="text-xs text-gray-600 dark:text-gray-400">{total} {total === 1 ? 'note' : 'notes'}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search notes..."
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition-all text-sm"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={filterType}
            onChange={(e) => { setFilterType(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition-all text-sm cursor-pointer appearance-none"
          >
            {noteTypes.map(type => (
              <option key={type} value={type}>
                {type === 'all' ? 'All Types' : type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-600 dark:text-gray-400">
          <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
          <span className="text-sm font-medium">Loading notes...</span>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            {displayed.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-12"
              >
                <div className="inline-block p-3 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">No notes found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {search || filterType !== 'all'
                    ? 'Try adjusting your search or filters'
                    : 'Create notes from algorithm, data structure or blog pages'}
                </p>
              </motion.div>
            ) : (
              <motion.div key="notes" className="mb-4">
                <div className="hidden md:block overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                  <table className="min-w-full text-sm text-left">
                    <thead className="bg-gray-50 dark:bg-gray-900 text-xs">
                      <tr>
                        <th className="px-3 py-2.5 font-semibold">Date</th>
                        <th className="px-3 py-2.5 font-semibold">Title</th>
                        <th className="px-3 py-2.5 font-semibold">Category</th>
                        <th className="px-3 py-2.5 font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {displayed.map(n => (
                        <tr key={n._id} className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300 text-xs">{new Date(n.createdAt || n.updatedAt).toLocaleDateString()}</td>
                          <td className="px-3 py-2.5 text-sm font-medium text-gray-900 dark:text-white">{(n.parentId && (n.parentId.title || n.parentId.slug)) || '—'}</td>
                          <td className="px-3 py-2.5 text-xs text-gray-600 dark:text-gray-300">{n.parentType || '—'}</td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-1">
                              <button
                                title="Edit note"
                                onClick={() => {
                                  const pId = n.parentId && (n.parentId._id || n.parentId);
                                  window.dispatchEvent(new CustomEvent('sdeverse:open-note-editor', { detail: { parentType: n.parentType, parentId: pId } }));
                                }}
                                className="inline-flex items-center justify-center p-0 rounded-md text-gray-600 hover:text-gray-800 dark:text-gray-200"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              {n.parentType && n.parentId && (
                                <a className="inline-flex items-center justify-center p-0 rounded-md text-blue-600 hover:text-blue-800 dark:text-blue-400" href={n.parentType === 'Algorithm' ? `/algorithms/${n.parentId.slug}` : `/data-structures/${n.parentId.slug}`} target="_blank" rel="noreferrer" title="Open parent"><LinkIcon className="w-4 h-4" /></a>
                              )}
                              <button onClick={async () => { if (!window.confirm('Delete this note?')) return; const pId = n.parentId && (n.parentId._id || n.parentId); try { await dispatch(removeNote({ parentType: n.parentType, parentId: pId })).unwrap(); dispatch(fetchMyNotes({ page, limit, q: search || '', parentType: filterType === 'all' ? '' : filterType })); } catch (err) { console.error('Failed to delete note', err); } }} title="Delete note" className="inline-flex items-center justify-center p-0 rounded-md text-red-600 hover:text-red-800 dark:text-red-400"><Trash2 className="w-4 h-4" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-2">
                  {displayed.map(n => (
                    <div key={n._id} className="p-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 dark:text-white truncate">{(n.parentId && (n.parentId.title || n.parentId.slug)) || '—'}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">{n.parentType || '—'} • {new Date(n.createdAt || n.updatedAt).toLocaleDateString()}</div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              const pId = n.parentId && (n.parentId._id || n.parentId);
                              window.dispatchEvent(new CustomEvent('sdeverse:open-note-editor', { detail: { parentType: n.parentType, parentId: pId } }));
                            }}
                            className="inline-flex items-center justify-center p-0 rounded-md text-gray-600 hover:text-gray-800 dark:text-gray-200"
                          ><Edit3 className="w-4 h-4" /></button>
                          {n.parentType && n.parentId && (
                            <a className="inline-flex items-center justify-center p-0 rounded-md text-blue-600 hover:text-blue-800 dark:text-blue-400" href={n.parentType === 'Algorithm' ? `/algorithms/${n.parentId.slug}` : `/data-structures/${n.parentId.slug}`} target="_blank" rel="noreferrer"><LinkIcon className="w-4 h-4" /></a>
                          )}
                          <button onClick={async () => { if (!window.confirm('Delete this note?')) return; const pId = n.parentId && (n.parentId._id || n.parentId); try { await dispatch(removeNote({ parentType: n.parentType, parentId: pId })).unwrap(); dispatch(fetchMyNotes({ page, limit, q: search || '', parentType: filterType === 'all' ? '' : filterType })); } catch (err) { console.error('Failed to delete note', err); } }} className="inline-flex items-center justify-center p-0 rounded-md text-red-600 hover:text-red-800 dark:text-red-400"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {displayed.length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Pagination currentPage={page} totalPages={pages || Math.max(1, Math.ceil(total / limit))} onPageChange={(p) => setPage(p)} />
            </div>
          )}
        </>
      )}
    </motion.div>
  );
}