import api from "../../utils/api";

// ✅ Submit a new contact message
export const submitContact = async (payload) => {
  try {
    const response = await api.post("/contact", payload);
    return response.data;
  } catch (error) {
    console.error("Error submitting contact form:", error);
    throw error;
  }
};

// ✅ Fetch all contact submissions (for Admin Dashboard)
export const fetchAllContacts = async () => {
  try {
    const response = await api.get("/contact"); // Adjust if admin route differs (e.g., /contact/all)
    return response.data;
  } catch (error) {
    console.error("Error fetching contact messages:", error);
    throw error;
  }
};

export const deleteContact = async (id) => {
  try {
    const response = await api.delete(`/contact/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting contact:", error);
    throw error;
  }
};
