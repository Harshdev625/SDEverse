import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createBlog } from "../features/blog/blogSlice";
import { toast } from "react-toastify";
import { selectCurrentUser } from "../features/auth/authSlice";
import { useNavigate } from "react-router-dom";

const initial = {
  title: "",
  category: "StudyResources",
  studySubtype: "DSA",
  company: "",
  role: "",
  tagsInput: "",
  content: "",
};

const BlogSubmit = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [form, setForm] = useState(initial);
  const { loading } = useSelector((s) => s.blog || {});

  const handleChange = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!user) return toast.info("Login to submit a blog");

    const tags = form.tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload = {
      title: form.title,
      content: form.content,
      category: form.category,
      tags,
    };
    if (form.category === "StudyResources") {
      payload.studySubtype = form.studySubtype || "Other";
    } else {
      payload.company = form.company;
      payload.role = form.role;
    }

    try {
      const created = await dispatch(createBlog(payload)).unwrap();
      toast.success("Blog submitted for review");
      navigate(`/blogs/${created.slug}`);
    } catch (err) {
      toast.error("Failed to submit blog");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">Submit a Blog</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input className="w-full border rounded px-3 py-2" value={form.title} onChange={(e)=>handleChange("title", e.target.value)} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium">Category</label>
            <select className="w-full border rounded px-3 py-2" value={form.category} onChange={(e)=>handleChange("category", e.target.value)}>
              <option value="StudyResources">Study Resources</option>
              <option value="InterviewExperiences">Interview Experiences</option>
            </select>
          </div>
          {form.category === "StudyResources" ? (
            <div>
              <label className="block text-sm font-medium">Study Subtype</label>
              <select className="w-full border rounded px-3 py-2" value={form.studySubtype} onChange={(e)=>handleChange("studySubtype", e.target.value)}>
                <option value="DSA">DSA</option>
                <option value="SystemDesign">System Design</option>
                <option value="CSFundamentals">CS Fundamentals</option>
                <option value="Other">Other</option>
              </select>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium">Company</label>
                <input className="w-full border rounded px-3 py-2" value={form.company} onChange={(e)=>handleChange("company", e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-medium">Role</label>
                <input className="w-full border rounded px-3 py-2" value={form.role} onChange={(e)=>handleChange("role", e.target.value)} />
              </div>
            </>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium">Tags (comma separated)</label>
          <input className="w-full border rounded px-3 py-2" value={form.tagsInput} onChange={(e)=>handleChange("tagsInput", e.target.value)} placeholder="dp, arrays, amazon" />
        </div>

        <div>
          <label className="block text-sm font-medium">Content</label>
          <textarea className="w-full border rounded px-3 py-2" rows={10} value={form.content} onChange={(e)=>handleChange("content", e.target.value)} required />
        </div>

        <button type="submit" disabled={loading} className="px-4 py-2 bg-indigo-600 text-white rounded">
          {loading ? "Submitting..." : "Submit for Review"}
        </button>
      </form>
    </div>
  );
};

export default BlogSubmit;
