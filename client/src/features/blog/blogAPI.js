import api from "../../utils/api";

export const getAllBlogs = async (params = {}) => {
  try {
    const response = await api.get("/blogs", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching all blogs:", error);
    throw error;
  }
};

export const getBlogBySlug = async (slug) => {
  try {
    const response = await api.get(`/blogs/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching blog by slug ${slug}:`, error);
    throw error;
  }
};

export const getBlogForEdit = async (slug) => {
  try {
    const response = await api.get(`/blogs/user/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching blog for edit ${slug}:`, error);
    throw error;
  }
};

export const getBlogsByAuthor = async (username) => {
  try {
    const response = await api.get(`/blogs/author/${username}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching blogs by author ${username}:`, error);
    throw error;
  }
};

export const createBlog = async (blogData) => {
  try {
    const response = await api.post("/blogs", blogData);
    return response.data;
  } catch (error) {
    console.error("Error creating blog:", error);
    throw error;
  }
};

export const updateBlog = async (slug, blogData) => {
  try {
    const response = await api.put(`/blogs/${slug}`, blogData);
    return response.data;
  } catch (error) {
    console.error(`Error updating blog ${slug}:`, error);
    throw error;
  }
};

export const deleteBlog = async (slug) => {
  try {
    const response = await api.delete(`/blogs/${slug}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting blog ${slug}:`, error);
    throw error;
  }
};

export const likeBlog = async (slug) => {
  try {
    const response = await api.post(`/blogs/${slug}/like`, {});
    return response.data;
  } catch (error) {
    console.error(`Error liking blog ${slug}:`, error);
    throw error;
  }
};

export const getMyBlogs = async () => {
  try {
    const response = await api.get("/blogs/user/my-blogs");
    return response.data;
  } catch (error) {
    console.error("Error fetching user's blogs:", error);
    throw error;
  }
};

export const getDraftBlogs = async (params = {}) => {
  try {
    const response = await api.get("/blogs/admin/drafts", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching draft blogs:", error);
    throw error;
  }
};

export const publishDraft = async (slug) => {
  try {
    const response = await api.put(`/blogs/admin/${slug}/publish`, {});
    return response.data;
  } catch (error) {
    console.error(`Error publishing draft ${slug}:`, error);
    throw error;
  }
};

export const rejectDraft = async (slug) => {
  try {
    const response = await api.delete(`/blogs/admin/${slug}/reject`);
    return response.data;
  } catch (error) {
    console.error(`Error rejecting draft ${slug}:`, error);
    throw error;
  }
};

export const getBlogCategories = async () => {
  try {
    const response = await api.get("/blogs/categories");
    return response.data;
  } catch (error) {
    console.error("Error fetching blog categories:", error);
    throw error;
  }
};

export const getPopularTags = async () => {
  try {
    const response = await api.get("/blogs/tags");
    return response.data;
  } catch (error) {
    console.error("Error fetching popular tags:", error);
    throw error;
  }
};
