import React, { useState } from "react";
import { Toaster, toast } from "react-hot-toast";


const ContactForm = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState({ type: "", message: "" });

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Email & phone validation
  const validateEmail = (email) => /\S+@\S+\.\S+/.test(email);
  const validatePhone = (phone) => /^[0-9]{10,15}$/.test(phone);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.email ||
      !formData.phone ||
      !formData.subject ||
      !formData.message
    ) {
      toast.error("Please fill in all required fields.")
      return;
    }

    if (!validateEmail(formData.email)) {
      toast.error("Please enter a valid email address." )
      return;
    }

    if (!validatePhone(formData.phone)) {
      toast.error("Please enter a valid phone number (digits only).")
      return;
    }

    // Simulate async form submission
    setTimeout(() => {
     toast.success("Your message has been sent successfully!")
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      });
    }, 1200);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Toaster position="top-right" />
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

      {/* Row 2: Email & Phone */}
      <div className="grid md:grid-cols-2 gap-4">
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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <input
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            placeholder="9876543210"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                       bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100
                       focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>
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

      {/* Status Message */}
      {status.message && (
        <p
          className={`text-sm font-medium ${
            status.type === "success"
              ? "text-green-600 dark:text-green-400"
              : status.type === "error"
              ? "text-red-600 dark:text-red-400"
              : "text-indigo-600 dark:text-indigo-400"
          }`}
        >
          {status.message}
        </p>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={status.type === "loading"}
        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg 
                   transition duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {status.type === "loading" ? "Sending..." : "Send Message"}
      </button>
    </form>
  );
};

export default ContactForm;
