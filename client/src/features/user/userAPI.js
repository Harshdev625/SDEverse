import api from "../../utils/api";

// User search for mentions
export const searchUsers = async (query) => {
  try {
    const response = await api.get(`/users/search?query=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

// Admin functions
export const fetchAllUsers = async (token, params = {}) => {
  try {
    const response = await api.get("/users", {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching all users:", error);
    throw error;
  }
};

export const fetchUserById = async (id, token) => {
  try {
    const response = await api.get(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching user by ID:", error);
    throw error;
  }
};

export const fetchUserByUsername = async (username) => {
  try {
    const response = await api.get(`/users/username/${username}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching user by username:", error);
    throw error;
  }
};

export const deleteUserById = async (id, token) => {
  try {
    const response = await api.delete(`/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

export const updateUserRole = async (id, role, token) => {
  try {
    const response = await api.put(`/users/${id}/role`, { role }, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
};

export const fetchAdminAnalytics = async (token) => {
  try {
    const response = await api.get("/users/analytics", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    throw error;
  }
};

// Profile functions
export const fetchMyProfile = async (token) => {
  try {
    const response = await api.get("/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching my profile:", error);
    throw error;
  }
};

export const updateMyProfile = async (profileData, token) => {
  try {
    const response = await api.patch("/users/me", profileData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.user;
  } catch (error) {
    console.error("Error updating my profile:", error);
    throw error;
  }
};

// Stats update functions
export const updateSocialProfiles = async (token) => {
  try {
    const response = await api.get("/users/update-social-stats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating social profiles:", error);
    throw error;
  }
};

export const updateCompetitiveStats = async (token) => {
  try {
    const response = await api.get("/users/update-competitive-stats", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating competitive stats:", error);
    throw error;
  }
};

export const updateSingleSocialStat = async (platform, token) => {
  try {
    const response = await api.get(`/users/update-social-stats/${platform}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating single social stat:", error);
    throw error;
  }
};

export const updateSingleCompetitiveStat = async (platform, token) => {
  try {
    const response = await api.get(`/users/update-competitive-stats/${platform}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating single competitive stat:", error);
    throw error;
  }
};