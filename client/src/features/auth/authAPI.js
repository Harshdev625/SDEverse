import api from "../../utils/api";

export const registerUserAPI = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};

export const loginUserAPI = async (userData) => {
  const response = await api.post("/auth/login", userData);
  return response.data;
};

export const getMeAPI = async (token) => {
  const response = await api.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
};

export const forgotPasswordAPI = async (emailData) => {
  const response = await api.post("/auth/forgot-password", emailData);
  return response.data;
};

export const validateOTPAPI = async (otpData) => {
  const response = await api.post("/auth/validate-otp", otpData);
  return response.data;
};

export const resetPasswordAPI = async (resetData) => {
  const response = await api.post("/auth/reset-password", resetData);
  return response.data;
};