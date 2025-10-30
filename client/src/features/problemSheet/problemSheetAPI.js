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
    const res = await api.post(`/problem-sheets/problems/${problemId}/complete`, { completed });
    return res.data;
};

export const getProblemNotes = async (problemId) => {
    const res = await api.get(`/problem-sheets/problems/${problemId}/notes`);
    return res.data;
};

export const saveProblemNotes = async (problemId, notes) => {
    const res = await api.put(`/problem-sheets/problems/${problemId}/notes`, { content: notes });
    return res.data;
};

export const deleteProblemNotes = async (problemId) => {
    const res = await api.delete(`/problem-sheets/problems/${problemId}/notes`);
    return res.data;
};

export const getHintsSolution = async (problemId) => {
    const res = await api.get(`/problem-sheets/problems/${problemId}/hints-solution`);
    return res.data;
};