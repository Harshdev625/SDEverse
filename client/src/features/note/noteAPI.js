import api from '../../utils/api';

export const getNoteByParent = async (parentType, parentId) => {
  try {
    const res = await api.get(`/notes/parent/${parentType}/${parentId}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching note by parent:', error);
    throw error;
  }
};

export const upsertNote = async (data) => {
  try {
    const res = await api.post('/notes', data);
    return res.data;
  } catch (error) {
    console.error('Error upserting note:', error);
    throw error;
  }
};

export const deleteNoteByParent = async (parentType, parentId) => {
  try {
    const res = await api.delete(`/notes/parent/${parentType}/${parentId}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting note:', error);
    throw error;
  }
};

export const getMyNotes = async (page = 1, limit = 12, q = '', parentType = '') => {
  try {
    const qParam = q ? `&q=${encodeURIComponent(q)}` : '';
    const parentParam = parentType ? `&parentType=${encodeURIComponent(parentType)}` : '';
    const res = await api.get(`/notes/my?page=${page}&limit=${limit}${qParam}${parentParam}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching my notes:', error);
    throw error;
  }
};