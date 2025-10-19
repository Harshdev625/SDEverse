import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { addBookmark, removeBookmark, checkBookmark } from "../../features/bookmark/bookmarkSlice";
import { toast } from "react-toastify";

const BookmarkButton = ({ contentType, contentId, className = "" }) => {
  const dispatch = useDispatch();
  const { bookmarkStatus, status } = useSelector((state) => state.bookmark);
  const { token } = useSelector((state) => state.auth);
  
  const [isLoading, setIsLoading] = useState(false);
  const isBookmarked = bookmarkStatus[contentId] || false;

  useEffect(() => {
    if (token && contentId) {
      dispatch(checkBookmark(contentId));
    }
  }, [dispatch, contentId, token]);

  const handleBookmarkToggle = async () => {
    if (!token) {
      toast.error("Please login to bookmark content");
      return;
    }

    setIsLoading(true);
    
    try {
      if (isBookmarked) {
        await dispatch(removeBookmark({ contentId, contentType })).unwrap();
        toast.success("Bookmark removed");
      } else {
        await dispatch(addBookmark({ contentType, contentId })).unwrap();
        toast.success("Bookmark added");
      }
    } catch (error) {
      toast.error(error || "Failed to update bookmark");
    } finally {
      setIsLoading(false);
    }
  };

  const loading = isLoading || status.addBookmark === "loading" || status.removeBookmark === "loading";

  return (
    <button
      onClick={handleBookmarkToggle}
      disabled={loading}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200
        ${isBookmarked 
          ? "bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50" 
          : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        }
        ${loading ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
        ${className}
      `}
      title={isBookmarked ? "Remove bookmark" : "Add bookmark"}
    >
      {loading ? (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : isBookmarked ? (
        <BookmarkCheck className="w-4 h-4" />
      ) : (
        <Bookmark className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">
        {isBookmarked ? "Bookmarked" : "Bookmark"}
      </span>
    </button>
  );
};

export default BookmarkButton;