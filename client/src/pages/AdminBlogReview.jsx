import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import Loader from '../components/Loader';
import Button from '../components/ui/Button';
import { toast } from 'react-toastify';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function AdminBlogReview() {
  const token = useSelector(state => state.auth.token);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState([]);

  const fetchDrafts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/blogs/admin/drafts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDrafts(res.data.drafts || []);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to load drafts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrafts();
    // eslint-disable-next-line
  }, []);

  const handleApprove = async (slug) => {
    try {
      await axios.put(`${API_BASE_URL}/blogs/admin/${slug}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Published');
      setDrafts(prev => prev.filter(d => d.slug !== slug));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to publish');
    }
  };

  const handleReject = async (slug) => {
    if (!window.confirm('Reject and delete this draft?')) return;
    try {
      await axios.delete(`${API_BASE_URL}/blogs/admin/${slug}/reject`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Rejected');
      setDrafts(prev => prev.filter(d => d.slug !== slug));
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to reject');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader/></div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Admin — Drafts Review</h1>
      {drafts.length === 0 ? (
        <p>No drafts pending review.</p>
      ) : (
        <div className="space-y-4">
          {drafts.map(d => (
            <div key={d._id} className="p-4 border rounded-lg bg-white/80 dark:bg-gray-800/80">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-lg font-semibold">{d.title}</div>
                  <div className="text-sm text-gray-500">by {d.author?.fullName || d.author?.username} — {d.category}</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1 bg-green-600 text-white rounded" onClick={() => handleApprove(d.slug)}>Approve</button>
                  <button className="px-3 py-1 bg-red-600 text-white rounded" onClick={() => handleReject(d.slug)}>Reject</button>
                </div>
              </div>
              <p className="mt-3 text-sm text-gray-700 dark:text-gray-300">{d.excerpt}</p>
              <div className="mt-4">
                <a href={`/blogs/${d.slug}`} target="_blank" rel="noreferrer" className="text-indigo-600">Open</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
