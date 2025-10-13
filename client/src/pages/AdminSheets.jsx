import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { listSheets, createSheet, updateSheet, deleteSheet } from "../features/sheet/sheetSlice";
import { toast } from "react-toastify";

const emptyForm = { title: "", description: "", difficulty: "Mixed", platform: "Other" };

const AdminSheets = () => {
  const dispatch = useDispatch();
  const { items, loading, error } = useSelector((s) => s.sheet);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => { dispatch(listSheets()); }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await dispatch(updateSheet({ id: editingId, data: form })).unwrap();
        toast.success("Sheet updated");
      } else {
        await dispatch(createSheet(form)).unwrap();
        toast.success("Sheet created");
      }
      setForm(emptyForm); setEditingId(null);
    } catch (err) {
      toast.error("Operation failed");
    }
  };

  const handleEdit = (s) => {
    setEditingId(s._id);
    setForm({ title: s.title, description: s.description, difficulty: s.difficulty, platform: s.platform });
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this sheet?")) return;
    try { await dispatch(deleteSheet(id)).unwrap(); toast.success("Deleted"); } catch { toast.error("Delete failed"); }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Manage Sheets</h1>

      <form onSubmit={handleSubmit} className="space-y-3 p-4 border rounded mb-8">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input className="w-full border rounded px-3 py-2" value={form.title} onChange={(e)=>setForm({...form,title:e.target.value})} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea className="w-full border rounded px-3 py-2" rows={4} value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})} required />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm font-medium">Difficulty</label>
            <select className="w-full border rounded px-3 py-2" value={form.difficulty} onChange={(e)=>setForm({...form,difficulty:e.target.value})}>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
              <option>Mixed</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium">Platform</label>
            <select className="w-full border rounded px-3 py-2" value={form.platform} onChange={(e)=>setForm({...form,platform:e.target.value})}>
              <option>StriverA2Z</option>
              <option>NeetCode150</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">
          {editingId ? "Update" : "Create"} Sheet
        </button>
        {editingId && (
          <button type="button" onClick={()=>{setEditingId(null); setForm(emptyForm);}} className="ml-2 px-4 py-2 bg-gray-200 rounded">Cancel</button>
        )}
      </form>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{String(error)}</div>
      ) : (
        <div className="space-y-3">
          {items.map((s) => (
            <div key={s._id} className="p-4 border rounded flex justify-between items-start">
              <div>
                <div className="font-semibold text-lg">{s.title}</div>
                <div className="text-sm text-gray-600">{s.platform} • {s.difficulty}</div>
                <p className="text-sm mt-2 max-w-3xl">{s.description}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={()=>handleEdit(s)} className="px-3 py-2 bg-yellow-500 text-white rounded">Edit</button>
                <button onClick={()=>handleDelete(s._id)} className="px-3 py-2 bg-red-600 text-white rounded">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSheets;
