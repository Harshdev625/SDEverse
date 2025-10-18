import api from "../../utils/api";

export const createAlgorithm = async (data) => {
  const res = await api.post("/algorithms", data);
  return res.data;
};

export const getAllAlgorithms = async (params) => {
  const res = await api.get("/algorithms", { params });
  return {
    algorithms: res.data.algorithms,
    total: res.data.total,
    pages: res.data.pages,
    currentPage: res.data.currentPage,
  };
};

export const getAlgorithmsForList = async (params) => {
  const res = await api.get("/algorithms/list", { params });
  return {
    algorithms: res.data.algorithms,
    total: res.data.total,
  };
};


export const getAlgorithmBySlug = async (slug) => {
  const res = await api.get(`/algorithms/${slug}`);
  return res.data;
};

export const updateAlgorithm = async (slug, data) => {
  const res = await api.put(`/algorithms/${slug}`, data);
  return res.data;
};

export const deleteAlgorithm = async (slug) => {
  const res = await api.delete(`/algorithms/${slug}`);
  return res.data;
};

export const voteAlgorithm = async (slug, voteData) => {
  const res = await api.post(`/algorithms/${slug}/vote`, voteData);
  return res.data;
};

export const getCategories = async () => {
  const res = await api.get("/algorithms/categories");
  return res.data;
};

export const searchAlgorithms = async (params) => {
  const res = await api.get("/algorithms/search", { params });
  return {
    algorithms: res.data.results,
    total: res.data.total,
    pages: res.data.pages,
    currentPage: res.data.currentPage,
  };
};
