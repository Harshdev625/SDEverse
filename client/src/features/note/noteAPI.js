// In client/src/features/note/noteAPI.js
import api from '../../utils/api'; // This path is based on your project structure

/**
 * Gets a user's note for a specific algorithm
 * @param {string} algorithmId - The ID of the algorithm
 */
export const getNote = async (algorithmId) => {
  // This calls the GET /api/notes/:algorithmId endpoint you just made
  const res = await api.get(`/api/notes/${algorithmId}`);
  return res.data;
};

/**
 * Creates or updates a user's note
 * @param {object} noteData - The note data
 * @param {string} noteData.algorithmId - The ID of the algorithm
 * @param {string} noteData.content - The text content of the note
 */
export const setNote = async (noteData) => {
  // This calls the POST /api/notes endpoint you just made
  const res = await api.post('/api/notes', noteData);
  return res.data;
};