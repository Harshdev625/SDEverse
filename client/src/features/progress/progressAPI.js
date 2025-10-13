import api from "../../utils/api";

export const getMyProgressAPI = async (sheetId) => {
  const res = await api.get(`/progress/sheets/${sheetId}/my`);
  return res.data;
};

export const incrementProgressAPI = async (sheetId) => {
  const res = await api.post(`/progress/sheets/${sheetId}/increment`);
  return res.data;
};

export const setProgressAPI = async (sheetId, solvedCount) => {
  const res = await api.put(`/progress/sheets/${sheetId}`, { solvedCount });
  return res.data;
};
