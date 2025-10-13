import api from "../../utils/api";

export const createSheetAPI = async (data) => {
  const res = await api.post("/sheets", data);
  return res.data;
};

export const listSheetsAPI = async (params) => {
  const res = await api.get("/sheets", { params });
  return res.data;
};

export const getSheetBySlugAPI = async (slug) => {
  const res = await api.get(`/sheets/${slug}`);
  return res.data;
};

export const updateSheetAPI = async (id, data) => {
  const res = await api.put(`/sheets/${id}`, data);
  return res.data;
};

export const deleteSheetAPI = async (id) => {
  const res = await api.delete(`/sheets/${id}`);
  return res.data;
};
