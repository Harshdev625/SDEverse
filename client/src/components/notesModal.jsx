// In client/src/components/NotesModal.jsx
import React from 'react';
import NotesSection from './noteSection'; // Import the section component
import { X } from 'lucide-react'; // Icon for close button

const NotesModal = ({ algorithmId, onClose }) => {
  // Prevent clicks inside the modal from closing it
  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    // Backdrop (covers the screen, closes modal on click)
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500/10 backdrop-blur-lg"
      onClick={onClose} // Close modal if backdrop is clicked
    >
      {/* Modal Content Area */}
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-11/12 max-w-2xl p-6 relative text-gray-900 dark:text-gray-200"
        onClick={handleContentClick} // Prevent closing when clicking inside
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 dark:text-gray-400"
          aria-label="Close notes"
        >
          <X size={20} />
        </button>

        {/* Modal Title */}
        <h2 className="text-xl font-semibold mb-4">Personal Notes</h2>

        {/* Render the NotesSection component */}
        <NotesSection algorithmId={algorithmId} />

      </div>
    </div>
  );
};

export default NotesModal;