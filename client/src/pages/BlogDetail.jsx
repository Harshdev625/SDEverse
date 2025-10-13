import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getBlogBySlug, toggleLike, toggleBookmark } from "../features/blog/blogSlice";
import { selectCurrentUser } from "../features/auth/authSlice";
import CommentSection from "./CommentSection";
import { toast } from "react-toastify";

const BlogDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const { current: blog, loading, error } = useSelector((s) => s.blog || {});
  const user = useSelector(selectCurrentUser);

  useEffect(() => { dispatch(getBlogBySlug(slug)); }, [dispatch, slug]);

  const onLike = async () => {
    if (!user) return toast.info("Login to like");
    await dispatch(toggleLike(blog._id));
  };
  const onBookmark = async () => {
    if (!user) return toast.info("Login to bookmark");
    await dispatch(toggleBookmark(blog._id));
  };

  if (loading && !blog) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{String(error)}</div>;
  if (!blog) return null;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <h1 className="text-3xl font-bold">{blog.title}</h1>
      <div className="text-sm text-gray-600 mt-1">
        {blog.category === 'StudyResources' ? (blog.studySubtype || 'General') : (blog.company || 'Interview')} • {new Date(blog.createdAt).toLocaleString()}
      </div>
      {blog.tags?.length>0 && (
        <div className="mt-2 flex gap-2 flex-wrap">
          {blog.tags.map((t)=> (
            <span key={t} className="text-xs px-2 py-0.5 bg-gray-100 rounded">#{t}</span>
          ))}
        </div>
      )}

      <div className="prose dark:prose-invert max-w-none mt-6 whitespace-pre-wrap">
        {blog.content}
      </div>

      <div className="mt-6 flex gap-3">
        <button onClick={onLike} className="px-3 py-2 bg-blue-600 text-white rounded">❤ {blog.likesCount || 0}</button>
        <button onClick={onBookmark} className="px-3 py-2 bg-gray-200 rounded">Bookmark</button>
      </div>

      <div className="mt-10">
        <CommentSection parentType="Blog" parentId={blog._id} parentSlug={blog.slug} />
      </div>
    </div>
  );
};

export default BlogDetail;
