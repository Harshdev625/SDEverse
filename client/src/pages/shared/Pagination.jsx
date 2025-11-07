import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function Pagination({ currentPage, totalPages, onPageChange }) {
  return (
    <div className="flex justify-center mt-8 space-x-2">
      <button
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="px-3 py-2 rounded
        bg-gray-200 text-gray-800 hover:bg-gray-300
        dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600
        disabled:opacity-50"
      >
        <FaChevronLeft />
      </button>
      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          onClick={() => onPageChange(i + 1)}
          className={`px-3 py-2 rounded ${
            currentPage === i + 1
              ? "bg-indigo-600 text-white dark:bg-indigo-600 dark:text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
          }`}
        >
          {i + 1}
        </button>
      ))}
      <button
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
        className="px-3 py-2 rounded
        bg-gray-200 text-gray-800 hover:bg-gray-300
        dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600
        disabled:opacity-50"
      >
        <FaChevronRight />
      </button>
    </div>
  );
}

export default Pagination;
