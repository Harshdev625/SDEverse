// In client/src/components/NotesSection.jsx
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  getNoteAsync,
  setNoteAsync,
  setNoteContent,
  selectNoteContent,
  selectNoteStatus,
  selectNoteSaveStatus,
} from '../features/note/noteSlice';
import { Loader2, Save } from 'lucide-react';

const NotesSection = ({ algorithmId }) => {
  const dispatch = useDispatch();

  // Get note data from Redux store
  const noteContent = useSelector(selectNoteContent);
  const noteStatus = useSelector(selectNoteStatus);
  const saveStatus = useSelector(selectNoteSaveStatus);

  // --- Get user info from Redux store ---
  // <-- CHECK THIS LINE: Does your 'auth' slice use '.userInfo' or something else (like '.user')?
  // Option 1 (if it's named userInfo):
  const userInfo = useSelector((state) => state.auth.user);
  // Option 2 (if it's named user):
  // const { user: userInfo } = useSelector((state) => state.auth);
  // Option 3 (Alternative if Option 2 doesn't work):
  // const userInfo = useSelector((state) => state.auth.user);
  // --- Make sure 'userInfo' variable has the correct data ---

  // Fetch the note when the component mounts (if logged in)
  useEffect(() => {
    // This condition checks if userInfo exists and has data
    if (userInfo && algorithmId) {
      dispatch(getNoteAsync(algorithmId));
    }
    // Only re-run if these specific values change
  }, [userInfo, algorithmId, dispatch]);

  // Handle saving the note
  const handleSave = () => {
    dispatch(setNoteAsync({ algorithmId, content: noteContent }));
  };

  // Update local Redux state as user types
  const handleTextChange = (e) => {
    dispatch(setNoteContent(e.target.value));
  };

  // Don't show anything if user is not logged in
  // This check relies on the 'userInfo' variable being correctly populated
  if (!userInfo) {
    return null;
  }

  const isLoading = noteStatus === 'loading';
  const isSaving = saveStatus === 'loading';

  // Return the main content directly
  return (
    <div className="mt-0">
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="animate-spin" size={24} />
        </div>
      ) : (
        <>
          <textarea
            value={noteContent}
            onChange={handleTextChange}
            placeholder="Type your notes here..."
            className="w-full h-48 p-3 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          />
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition duration-200 shadow-md"
          >
            {isSaving ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Save size={16} />
            )}
            {isSaving ? 'Saving...' : 'Save Notes'}
          </button>
        </>
      )}
    </div>
  );
};

export default NotesSection;