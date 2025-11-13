import api from '../../utils/api';

export const getBookmarkByParent = async (parentType, parentId) => {
  try {
    const res = await api.get(`/bookmarks/parent/${parentType}/${parentId}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching bookmark by parent:', error);
    throw error;
  }
};

export const upsertBookmark = async (data) => {
  try {
    const res = await api.post('/bookmarks', data);
    return res.data;
  } catch (error) {
    console.error('Error upserting bookmark:', error);
    throw error;
  }
};

export const deleteBookmarkByParent = async (parentType, parentId) => {
  try {
    const res = await api.delete(`/bookmarks/parent/${parentType}/${parentId}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting bookmark:', error);
    throw error;
  }
};

export const getMyBookmarks = async (page = 1, limit = 12, q = '', parentType = '') => {
  try {
    const qParam = q ? `&q=${encodeURIComponent(q)}` : '';
    const parentParam = parentType ? `&parentType=${encodeURIComponent(parentType)}` : '';
    const res = await api.get(`/bookmarks/my?page=${page}&limit=${limit}${qParam}${parentParam}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching my bookmarks:', error);
    throw error;
  }
};
