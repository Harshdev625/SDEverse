import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyBlogs } from '../features/blog/blogSlice';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Calendar } from 'lucide-react';
import Loader from '../components/Loader';
import Button from '../components/ui/Button';

export default function MyBlogs() {
  const dispatch = useDispatch();
  const { myBlogs = [], loading, error } = useSelector(state => state.blog);

  const [query, setQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  useEffect(() => {
    dispatch(fetchMyBlogs());
  }, [dispatch]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return myBlogs.filter(b => {
      if (filterStatus !== 'all') {
        if (filterStatus === 'draft' && b.status !== 'draft') return false;
        if (filterStatus === 'pending' && b.reviewStatus !== 'pending') return false;
        if (filterStatus === 'published' && b.reviewStatus !== 'approved') return false;
      }
      if (!q) return true;
      return (b.title || '').toLowerCase().includes(q) || (b.tags || []).join(' ').toLowerCase().includes(q) || (b.excerpt || '').toLowerCase().includes(q);
    });
  }, [myBlogs, query, filterStatus]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center"><Loader/></div>
  );

  return (
    <div className="min-h-screen py-10 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="p-3 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Posts</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">Manage your drafts and submitted posts</p>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-end gap-3 w-full">
            <div className="hidden sm:flex items-center w-full max-w-md">
              <input value={query} onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }} placeholder="Search your posts..." className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
            </div>
            <div className="flex items-center gap-3">
              <Link to="/blogs/new">
                <Button className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg">Create Post</Button>
              </Link>
              <Link to="/blogs">
                <Button className="px-3 py-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg border border-gray-200 dark:border-gray-600">Explore Blogs</Button>
              </Link>
            </div>
          </div>
          {/* mobile search */}
          <div className="sm:hidden mt-3">
            <input value={query} onChange={(e) => { setQuery(e.target.value); setCurrentPage(1); }} placeholder="Search your posts..." className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Search & Filters */}
          <aside className="lg:col-span-1">
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-white dark:bg-gray-800/80 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">Status</label>
                  <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 text-gray-900 dark:text-white">
                  <option value="all">All</option>
                  <option value="draft">Draft</option>
                  <option value="pending">Pending Review</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </motion.div>
          </aside>

          {/* List */}
          <main className="lg:col-span-2">
            {error && <div className="mb-4 text-red-600">{error}</div>}

            {filtered.length === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white dark:bg-gray-800/80 p-8 rounded-2xl shadow-sm border border-dashed border-gray-200 dark:border-gray-700 text-center">
                <div className="mx-auto max-w-md">
                  <div className="flex items-center justify-center w-20 h-20 mx-auto rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 mb-4">
                    <BookOpen size={28} />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No posts yet</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">You don’t have any posts yet. Start by creating a new draft or publish one of your pending posts.</p>
                  <div className="mt-6 flex items-center justify-center gap-3">
                    <Link to="/blogs/new"><Button className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Create first post</Button></Link>
                    <Link to="/blogs"><Button className="px-4 py-2 bg-white dark:bg-gray-700 rounded-lg">Browse community</Button></Link>
                  </div>
                </div>
              </motion.div>
            ) : (
              <>
                <div className="space-y-4">
                  {filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((b) => (
                  <motion.article key={b._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="bg-white dark:bg-gray-800/80 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                      <div className="flex-1">
                        <Link to={`/blogs/${b.slug}`} className="text-lg font-semibold text-gray-900 dark:text-white hover:text-indigo-600">{b.title}</Link>
                        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">{b.category} • {b.tags?.slice(0,3).join(', ')}</div>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 line-clamp-3">{b.excerpt}</p>
                      </div>

                      <div className="flex-shrink-0 text-sm flex flex-col items-end justify-between">
                        <div className="flex items-center gap-2">
                          {/* status badges */}
                          {b.status === 'draft' && <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full">Draft</span>}
                          {b.reviewStatus === 'pending' && <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full">Pending</span>}
                          {b.reviewStatus === 'approved' && b.status !== 'draft' && <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full">Published</span>}
                          {b.reviewStatus === 'rejected' && <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full">Rejected</span>}
                        </div>

                        <div className="mt-3 flex items-center gap-3">
                          <Link to={`/blogs/${b.slug}/edit`} className="text-sm text-indigo-600 hover:underline">Edit</Link>
                          <Link to={`/blogs/${b.slug}`} className="text-sm text-gray-600 dark:text-gray-300 hover:underline">View</Link>
                        </div>

                        <div className="mt-3 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar size={12} />
                          <span>{new Date(b.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                  ))}
                </div>

                {/* Pagination controls */}
                {Math.ceil(filtered.length / pageSize) > 1 && (
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50">Previous</button>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Page {currentPage} of {Math.ceil(filtered.length / pageSize)}</span>
                    <button onClick={() => setCurrentPage(Math.min(Math.ceil(filtered.length / pageSize), currentPage + 1))} disabled={currentPage === Math.ceil(filtered.length / pageSize)} className="px-3 py-1 rounded-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 disabled:opacity-50">Next</button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
