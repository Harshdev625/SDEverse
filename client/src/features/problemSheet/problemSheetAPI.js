import api from '../../utils/api';

export const getAllSheets = async () => {
    const res = await api.get('/problem-sheets');
    return res.data; 
};

export const getSheetById = async (sheetId) => {
    const res = await api.get(`/problem-sheets/${sheetId}`);
    return res.data;
};

export const getSheetProblems = async (sheetId, params = {}) => {
    const res = await api.get(`/problem-sheets/${sheetId}/problems`, { params });
    return res.data;
};

export const getSheetMetrics = async (sheetId, params = {}) => {
    const res = await api.get(`/problem-sheets/${sheetId}/metrics`, { params });
    return res.data;
};

export const markProblemComplete = async (problemId, completed) => {
    const res = await api.post(`/problems/${problemId}/complete`, { completed });
    return res.data;
};

export const getProblemNotes = async (problemId) => {
    const res = await api.get(`/problems/${problemId}/notes`);
    return res.data;
};

export const saveProblemNotes = async (problemId, notes) => {
    const res = await api.put(`/problems/${problemId}/notes`, { content: notes });
    return res.data;
};

export const deleteProblemNotes = async (problemId) => {
    const res = await api.delete(`/problems/${problemId}/notes`);
    return res.data;
};

export const getHintsSolution = async (problemId) => {
    const res = await api.get(`/problems/${problemId}/hints-solution`);
    return res.data;
};