import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { listPublicBlogs } from "../features/blog/blogSlice";
import { Link } from "react-router-dom";

const Blogs = () => {
  const dispatch = useDispatch();
  const { items = [], loading, error } = useSelector((s) => s.blog || {});

  const [category, setCategory] = useState("");
  const [studySubtype, setStudySubtype] = useState("");
  const [company, setCompany] = useState("");
  const [tag, setTag] = useState("");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("-createdAt");

  useEffect(() => {
    dispatch(listPublicBlogs({ category: category || undefined, studySubtype: studySubtype || undefined, company: company || undefined, tag: tag || undefined, q: q || undefined, sort }));
  }, [dispatch, category, studySubtype, company, tag, q, sort]);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-6">Blogs</h1>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
        <select className="border rounded px-3 py-2" value={category} onChange={(e)=>{setCategory(e.target.value); setStudySubtype(""); setCompany("");}}>
          <option value="">All Categories</option>
          <option value="StudyResources">Study Resources</option>
          <option value="InterviewExperiences">Interview Experiences</option>
        </select>
        <select className="border rounded px-3 py-2" value={studySubtype} onChange={(e)=>setStudySubtype(e.target.value)} disabled={category!=="StudyResources"}>
          <option value="">Subtype</option>
          <option value="DSA">DSA</option>
          <option value="SystemDesign">System Design</option>
          <option value="CSFundamentals">CS Fundamentals</option>
          <option value="Other">Other</option>
        </select>
        <input className="border rounded px-3 py-2" placeholder="Company" value={company} onChange={(e)=>setCompany(e.target.value)} disabled={category!=="InterviewExperiences"} />
        <input className="border rounded px-3 py-2" placeholder="Tag" value={tag} onChange={(e)=>setTag(e.target.value)} />
        <input className="border rounded px-3 py-2" placeholder="Search..." value={q} onChange={(e)=>setQ(e.target.value)} />
        <select className="border rounded px-3 py-2" value={sort} onChange={(e)=>setSort(e.target.value)}>
          <option value="-createdAt">Newest</option>
          <option value="createdAt">Oldest</option>
          <option value="-likesCount">Top liked</option>
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{String(error)}</div>
      ) : items.length === 0 ? (
        <div>No blogs found.</div>
      ) : (
        <div className="space-y-4">
          {items.map((b) => (
            <Link key={b.slug} to={`/blogs/${b.slug}`} className="block p-4 border rounded hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">{b.title}</h3>
                <span className="text-sm px-2 py-1 bg-gray-100 rounded">{b.category}</span>
              </div>
              <div className="text-sm mt-1 text-gray-600">
                {b.category === 'StudyResources' ? (b.studySubtype || 'General') : (b.company || 'Interview')}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {new Date(b.createdAt).toLocaleString()} • by {b.author?.username || 'User'} • ❤ {b.likesCount || 0}
              </div>
              {b.tags?.length>0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {b.tags.map((t)=> (
                    <span key={t} className="text-xs px-2 py-0.5 bg-gray-100 rounded">#{t}</span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blogs;
