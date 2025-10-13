import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { listPublicBlogs, approveBlog, rejectBlog, deleteBlog, updateBlog } from "../features/blog/blogSlice";
import { toast } from "react-toastify";

const AdminBlogs = () => {
  const dispatch = useDispatch();
  const { items = [], loading, error } = useSelector((s) => s.blog || {});

  const [filters, setFilters] = useState({ status: "", category: "", q: "", sort: "-createdAt" });
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("");

  useEffect(() => {
    // Using public list for simplicity; in real admin view, add admin-specific endpoint if needed
    dispatch(listPublicBlogs({ ...filters, status: filters.status || undefined, category: filters.category || undefined, q: filters.q || undefined, sort: filters.sort }));
  }, [dispatch, filters]);

  const reload = () => {
    dispatch(listPublicBlogs({ ...filters, status: filters.status || undefined, category: filters.category || undefined, q: filters.q || undefined, sort: filters.sort }));
  };

  const onApprove = async (id) => {
    try { await dispatch(approveBlog(id)).unwrap(); toast.success("Approved"); reload(); } catch { toast.error("Approve failed"); }
  };
  const onReject = async (id) => {
    const notes = prompt("Review notes (optional):") || "";
    try { await dispatch(rejectBlog({ id, reviewNotes: notes })).unwrap(); toast.success("Rejected"); reload(); } catch { toast.error("Reject failed"); }
  };
  const onDelete = async (id) => {
    if (!confirm("Delete this blog?")) return;
    try { await dispatch(deleteBlog(id)).unwrap(); toast.success("Deleted"); reload(); } catch { toast.error("Delete failed"); }
  };
  const onBeginEdit = (b) => { setEditId(b._id); setEditTitle(b.title); };
  const onSaveEdit = async () => {
    try { await dispatch(updateBlog({ id: editId, data: { title: editTitle } })).unwrap(); toast.success("Updated"); setEditId(null); setEditTitle(""); reload(); } catch { toast.error("Update failed"); }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Manage Blogs</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        <select className="border rounded px-3 py-2" value={filters.status} onChange={(e)=>setFilters(f=>({...f, status: e.target.value}))}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <select className="border rounded px-3 py-2" value={filters.category} onChange={(e)=>setFilters(f=>({...f, category: e.target.value}))}>
          <option value="">All Categories</option>
          <option value="StudyResources">Study Resources</option>
          <option value="InterviewExperiences">Interview Experiences</option>
        </select>
        <input className="border rounded px-3 py-2" placeholder="Search..." value={filters.q} onChange={(e)=>setFilters(f=>({...f, q: e.target.value}))} />
        <select className="border rounded px-3 py-2" value={filters.sort} onChange={(e)=>setFilters(f=>({...f, sort: e.target.value}))}>
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="-likesCount">Top liked</option>
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{String(error)}</div>
      ) : (
        <div className="space-y-4">
          {items.map((b) => (
            <div key={b._id || b.slug} className="p-4 border rounded flex justify-between items-start">
              <div className="max-w-3xl">
                {editId === b._id ? (
                  <input className="w-full border rounded px-3 py-2" value={editTitle} onChange={(e)=>setEditTitle(e.target.value)} />
                ) : (
                  <div className="text-lg font-semibold">{b.title}</div>
                )}
                <div className="text-sm text-gray-600">{b.category} • {b.studySubtype || b.company || "General"} • ❤ {b.likesCount || 0}</div>
                <div className="text-xs text-gray-500">{new Date(b.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex gap-2 flex-wrap justify-end">
                {editId === b._id ? (
                  <>
                    <button onClick={onSaveEdit} className="px-3 py-2 bg-green-600 text-white rounded">Save</button>
                    <button onClick={()=>{setEditId(null); setEditTitle("");}} className="px-3 py-2 bg-gray-200 rounded">Cancel</button>
                  </>
                ) : (
                  <button onClick={()=>onBeginEdit(b)} className="px-3 py-2 bg-yellow-500 text-white rounded">Edit</button>
                )}
                <button onClick={()=>onApprove(b._id)} className="px-3 py-2 bg-blue-600 text-white rounded">Approve</button>
                <button onClick={()=>onReject(b._id)} className="px-3 py-2 bg-orange-600 text-white rounded">Reject</button>
                <button onClick={()=>onDelete(b._id)} className="px-3 py-2 bg-red-600 text-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminBlogs;
