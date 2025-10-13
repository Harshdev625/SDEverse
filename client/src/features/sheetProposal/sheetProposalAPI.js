import api from "../../utils/api";

export const submitSheetProposalAPI = async (sheetId, payload) => {
  const res = await api.post(`/sheet-proposals/${sheetId}/proposals`, payload);
  return res.data;
};

export const listMySheetProposalsAPI = async () => {
  const res = await api.get(`/sheet-proposals/me/proposals`);
  return res.data;
};

export const listSheetProposalsAPI = async (sheetId) => {
  const res = await api.get(`/sheet-proposals/${sheetId}/proposals`);
  return res.data;
};

export const approveSheetProposalAPI = async (proposalId) => {
  const res = await api.put(`/sheet-proposals/proposals/${proposalId}/approve`);
  return res.data;
};

export const rejectSheetProposalAPI = async (proposalId, payload) => {
  const res = await api.put(`/sheet-proposals/proposals/${proposalId}/reject`, payload);
  return res.data;
};
