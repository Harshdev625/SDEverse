import React from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { User, Calendar, Heart, MessageCircle, Eye, Bookmark } from "lucide-react";

const BlogPreview = ({ blog, author }) => {
  const themeMode = useSelector((state) => state.theme.mode);
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString();
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="max-w-4xl mx-auto">
      <article className={`${themeMode === 'dark' ? 'bg-gray-900/80 text-gray-100' : 'bg-white/90 text-gray-900'} backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden`}>
        {blog.featuredImage && (
          <div className="w-full h-64 md:h-96 overflow-hidden">
            <img src={blog.featuredImage} alt={blog.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center text-white">
                {author?.avatarUrl ? (
                  <img src={author.avatarUrl} alt={author.fullName || author.username} className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <User size={20} />
                )}
              </div>
              <div>
                <p className={`font-semibold ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>{author?.fullName || author?.username || "You"}</p>
                <p className={`${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-500'} text-xs flex items-center gap-2`}><Calendar size={12}/> {formatDate(blog.publishedAt || new Date())}</p>
              </div>
            </div>

            <div className={`flex items-center gap-3 text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <div className="flex items-center gap-1"><Eye size={16}/> <span>0</span></div>
              <div className="flex items-center gap-1"><Heart size={16}/> <span>0</span></div>
              <div className="flex items-center gap-1"><MessageCircle size={16}/> <span>0</span></div>
            </div>
          </div>

          <h1 className="text-3xl font-bold mb-3">{blog.title || "Untitled"}</h1>
          {blog.excerpt && <p className={`mb-6 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>{blog.excerpt}</p>}

          <div className={`prose prose-lg max-w-none ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-700'}`} dangerouslySetInnerHTML={{ __html: blog.content || "<p>Your content will appear here...</p>" }} />

          <div className="mt-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to="#" className="px-3 py-2 bg-indigo-600 text-white rounded-lg">Read full</Link>
              <button className={`${themeMode === 'dark' ? 'bg-gray-800' : 'bg-gray-100'} px-3 py-2 rounded-lg`}>Share</button>
            </div>
            <div className={`flex items-center gap-3 text-sm ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              <Bookmark size={16} /> <span>Save</span>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPreview;
