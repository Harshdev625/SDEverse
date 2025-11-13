import { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchMyBookmarks, removeBookmark } from "../../features/bookmark/bookmarkSlice";
import { Loader2, Search, Bookmark, FileText, Filter, Link as LinkIcon, Trash2 } from "lucide-react";
import Pagination from "../../pages/shared/Pagination";
import { motion as Motion, AnimatePresence } from "framer-motion";

export default function BookmarksPanel({ initialPage = 1 }) {
  const dispatch = useDispatch();
  const { bookmarks = [], loading, total = 0, pages = 1 } = useSelector(
    (state) => state.bookmark || {}
  );

  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const limit = 12;

  const loadBookmarks = useCallback(() => {
    const q = search || "";
    const parentType = filterType === "all" ? "" : filterType;
    dispatch(fetchMyBookmarks({ page, limit, q, parentType }));
  }, [dispatch, page, limit, search, filterType]);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const handleRemove = (b) => {
    if (!window.confirm("Remove this bookmark?")) return;
    const parentId = b.parentId && (b.parentId._id || b.parentId);
    dispatch(removeBookmark({ parentType: b.parentType, parentId })).then(() =>
      setTimeout(loadBookmarks, 400)
    );
  };

  const bookmarkTypes = ["all", "Algorithm", "DataStructure", "Blog"];
  const displayed = bookmarks || [];

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl shadow-lg border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 p-6"
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-blue-600 rounded-lg">
            <Bookmark className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">My Bookmarks</h2>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {total} total {total === 1 ? "bookmark" : "bookmarks"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="relative sm:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search bookmarks..."
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition-all text-sm"
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <select
            value={filterType}
            onChange={(e) => {
              setFilterType(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-900 outline-none transition-all text-sm cursor-pointer appearance-none"
          >
            {bookmarkTypes.map((type) => (
              <option key={type} value={type}>
                {type === "all" ? "All Types" : type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-gray-600 dark:text-gray-400">
          <Loader2 className="animate-spin text-blue-500 w-10 h-10" />
          <span className="text-sm font-medium">Loading bookmarks...</span>
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            {displayed.length === 0 ? (
              <Motion.div
                key="empty"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="text-center py-12"
              >
                <div className="inline-block p-3 bg-gray-100 dark:bg-gray-800 rounded-full mb-3">
                  <FileText className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  No bookmarks found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {search || filterType !== "all"
                    ? "Try adjusting your search or filters"
                    : "Create bookmarks from algorithm, data structure or blog pages"}
                </p>
              </Motion.div>
            ) : (
              <Motion.div key="bookmarks" className="mb-4">
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
                      {displayed.map((b) => (
                        <tr
                          key={b._id}
                          className="border-t border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300 text-xs">
                            {new Date(b.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-3 py-2.5 font-medium text-gray-900 dark:text-gray-100 text-sm">
                            {b.title ||
                              (b.parentId && (b.parentId.title || b.parentId.slug)) ||
                              b.link ||
                              "—"}
                          </td>
                          <td className="px-3 py-2.5 text-gray-600 dark:text-gray-300 text-xs">
                            {b.parentType || "—"}
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-center gap-2">
                              {b.link ? (
                                <a
                                  href={b.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:underline text-xs"
                                >
                                  <LinkIcon className="w-3.5 h-3.5" />
                                  <span className="sr-only">Open</span>
                                </a>
                              ) : (
                                <span className="text-gray-400 text-xs">—</span>
                              )}
                              <button
                                title="Remove bookmark"
                                onClick={() => handleRemove(b)}
                                className="inline-flex items-center justify-center p-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span className="sr-only">Remove</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="md:hidden space-y-2">
                  {displayed.map((b) => (
                    <div
                      key={b._id}
                      className="p-3 border rounded-lg bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            {b.title ||
                              (b.parentId && (b.parentId.title || b.parentId.slug)) ||
                              "—"}
                          </div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                            {b.parentType || "—"} •{" "}
                            {new Date(b.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {b.link && (
                            <a
                              href={b.link}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center p-1.5 rounded-md bg-gray-100 hover:bg-gray-200 text-blue-600 dark:bg-gray-900/30 dark:text-blue-400"
                            >
                              <LinkIcon className="w-3.5 h-3.5" />
                            </a>
                          )}
                          <button
                            onClick={() => handleRemove(b)}
                            className="inline-flex items-center justify-center p-1.5 rounded-md bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Motion.div>
            )}
          </AnimatePresence>

          {displayed.length > 0 && (
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <Pagination
                currentPage={page}
                totalPages={pages || Math.max(1, Math.ceil(total / limit))}
                onPageChange={setPage}
              />
            </div>
          )}
        </>
      )}
    </Motion.div>
  );
}
