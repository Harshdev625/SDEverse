import api from '../../utils/api';

export const createGroup = async (data) => {
  try {
    const res = await api.post('/link-groups', data);
    return res.data;
  } catch (error) {
    console.error('Error creating group:', error);
    throw error;
  }
};

export const getMyGroups = async (page = 1, limit = 20, q = '') => {
  try {
    const qParam = q ? `&q=${encodeURIComponent(q)}` : '';
    const res = await api.get(`/link-groups/my?page=${page}&limit=${limit}${qParam}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching my groups:', error);
    throw error;
  }
};

export const getGroup = async (id) => {
  try {
    const res = await api.get(`/link-groups/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching group:', error);
    throw error;
  }
};

export const updateGroup = async (id, data) => {
  try {
    const res = await api.put(`/link-groups/${id}`, data);
    return res.data;
  } catch (error) {
    console.error('Error updating group:', error);
    throw error;
  }
};

export const deleteGroup = async (id) => {
  try {
    const res = await api.delete(`/link-groups/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting group:', error);
    throw error;
  }
};

export const addLinkToGroup = async (groupId, data) => {
  try {
    const res = await api.post(`/link-groups/${groupId}/links`, data);
    return res.data;
  } catch (error) {
    console.error('Error adding link to group:', error);
    throw error;
  }
};

export const updateLinkInGroup = async (groupId, linkId, data) => {
  try {
    const res = await api.put(`/link-groups/${groupId}/links/${linkId}`, data);
    return res.data;
  } catch (error) {
    console.error('Error updating link in group:', error);
    throw error;
  }
};

export const removeLinkFromGroup = async (groupId, linkId) => {
  try {
    const res = await api.delete(`/link-groups/${groupId}/links/${linkId}`);
    return res.data;
  } catch (error) {
    console.error('Error removing link from group:', error);
    throw error;
  }
};

export const shareGroup = async (groupId, data) => {
  try {
    const res = await api.post(`/link-groups/${groupId}/share`, data);
    return res.data;
  } catch (error) {
    console.error('Error sharing group:', error);
    throw error;
  }
};

export const unshareGroup = async (groupId, userId) => {
  try {
    const res = await api.delete(`/link-groups/${groupId}/share/${userId}`);
    return res.data;
  } catch (error) {
    console.error('Error unsharing group:', error);
    throw error;
  }
};

export const getGroupsSharedWithMe = async (page = 1, limit = 20) => {
  try {
    const res = await api.get(`/link-groups/shared?page=${page}&limit=${limit}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching groups shared with me:', error);
    throw error;
  }
};
