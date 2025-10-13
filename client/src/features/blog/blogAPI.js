import api from "../../utils/api";

export const listPublicBlogsAPI = async (params) => {
  const res = await api.get("/blogs", { params });
  return res.data;
};

export const getBlogBySlugAPI = async (slug) => {
  const res = await api.get(`/blogs/${slug}`);
  return res.data;
};

export const createBlogAPI = async (data) => {
  const res = await api.post("/blogs", data);
  return res.data;
};

export const updateBlogAPI = async (id, data) => {
  const res = await api.put(`/blogs/${id}`, data);
  return res.data;
};

export const deleteBlogAPI = async (id) => {
  const res = await api.delete(`/blogs/${id}`);
  return res.data;
};

export const approveBlogAPI = async (id) => {
  const res = await api.put(`/blogs/${id}/approve`);
  return res.data;
};

export const rejectBlogAPI = async (id, reviewNotes) => {
  const res = await api.put(`/blogs/${id}/reject`, { reviewNotes });
  return res.data;
};

export const toggleLikeAPI = async (id) => {
  const res = await api.post(`/blogs/${id}/like`);
  return res.data;
};

export const toggleBookmarkAPI = async (id) => {
  const res = await api.post(`/blogs/${id}/bookmark`);
  return res.data;
};
