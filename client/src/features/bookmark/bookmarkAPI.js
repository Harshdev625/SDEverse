import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});


export const addBookmark = async (contentType, contentId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await api.post("/bookmarks", { contentType, contentId }, config);
  return response.data;
};


export const removeBookmark = async (contentId, token, contentType = null) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: contentType ? { contentType } : {},
  };
  
  const response = await api.delete(`/bookmarks/${contentId}`, config);
  return response.data;
};


export const getUserBookmarks = async (token, params = {}) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params,
  };
  
  const response = await api.get("/bookmarks", config);
  return response.data;
};


export const checkBookmark = async (contentId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  
  const response = await api.get(`/bookmarks/check/${contentId}`, config);
  return response.data;
};