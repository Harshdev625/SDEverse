import { BookmarkCheck } from "lucide-react";

const BookmarkIndicator = ({ isBookmarked, className = "" }) => {
  if (!isBookmarked) return null;

  return (
    <div 
      className={`absolute top-2 right-2 p-1.5 bg-blue-100 dark:bg-blue-900/50 rounded-full shadow-sm ${className}`}
      title="Bookmarked"
    >
      <BookmarkCheck 
        size={14} 
        className="text-blue-600 dark:text-blue-400" 
      />
    </div>
  );
};

export default BookmarkIndicator;