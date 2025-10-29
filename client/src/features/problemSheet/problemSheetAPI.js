import api from '../../api/apiClient';

export const getAllSheets = async () => {
    const res = await api.get('/problem-sheets');
    return res.data; 
};

export const getSheetById = async (sheetId) => {
    const res = await api.get(`/problem-sheets/${sheetId}`);
    return res.data;
};

export const getSuiteProblems = async (sheetId, suiteId, params = {}) => {
    const res = await api.get(`/problem-sheets/${sheetId}/suites/${suiteId}/problems`, { params });
    return res.data;
};

export const getSuiteMetrics = async (sheetId, suiteId, params = {}) => {
    const res = await api.get(`/problem-sheets/${sheetId}/suites/${suiteId}/metrics`, { params });
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

export const updateProblemNotes = async (problemId, notes) => {
    const res = await api.put(`/problems/${problemId}/notes`, { notes });
    return res.data;
};

export const getHintsSolution = async (problemId) => {
    const res = await api.get(`/problems/${problemId}/hints-solution`);
    return res.data;
};

export const unlockHint = async (problemId, hintNumber) => {
    const res = await api.post(`/problems/${problemId}/unlock-hint`, { hintNumber });
    return res.data;
};

export const unlockSolution = async (problemId) => {
    const res = await api.post(`/problems/${problemId}/unlock-solution`);
    return res.data;
};