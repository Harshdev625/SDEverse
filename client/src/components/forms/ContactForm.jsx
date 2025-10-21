import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  sendContact,
  clearContactStatus,
} from "../../features/contact/contactSlice";

const ContactForm = () => {
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.contact);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    subject: "",
    message: "",
  });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Email validation
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.subject ||
      !formData.message
    ) {
      toast.error("Please fill in all required fields.", { autoClose: 3000 });
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address.", { autoClose: 3000 });
      return;
    }

    // Dispatch Redux action
     dispatch(clearContactStatus());
    dispatch(sendContact(formData));
  };

  // Watch for status updates
  useEffect(() => {
    if (success) {
      toast.success("Your message has been sent successfully!", {
        autoClose: 3000,
      });
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        subject: "",
        message: "",
      });
      dispatch(clearContactStatus());
    }

    if (error) {
      toast.error("Failed to send message. Please try again later.", {
        autoClose: 3000,
      });
      dispatch(clearContactStatus());
    }
  }, [success, error, dispatch]);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Row 1: First Name & Last Name */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            First Name <span className="text-red-500">*</span>
          </label>
          <input
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="Aarav"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                       bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100
                       focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Last Name <span className="text-red-500">*</span>
          </label>
          <input
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="Sharma"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                       bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100
                       focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email <span className="text-red-500">*</span>
        </label>
        <input
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="example@email.com"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                     bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100
                     focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Subject <span className="text-red-500">*</span>
        </label>
        <input
          name="subject"
          value={formData.subject}
          onChange={handleChange}
          placeholder="Enter the subject of your message"
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                     bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100
                     focus:ring-2 focus:ring-indigo-500 focus:outline-none"
        />
      </div>

      {/* Message */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          name="message"
          rows="5"
          value={formData.message}
          onChange={handleChange}
          placeholder="Write your message here..."
          className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                     bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100
                     focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
        />
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg 
                   transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {loading ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
};

export default ContactForm;
