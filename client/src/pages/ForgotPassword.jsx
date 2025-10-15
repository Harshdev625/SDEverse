import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [resetLink, setResetLink] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResetLink(null);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/forgot-password", { email });
      setResetLink(res.data.resetLink);
      toast.success("Reset link generated successfully!");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg w-96">
        <h2 className="text-2xl font-bold text-center mb-6 text-gray-800 dark:text-white">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition"
          >
            {loading ? "Generating link..." : "Send Reset Link"}
          </button>
        </form>

        {resetLink && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
              Use this link to reset your password:
            </p>
            <a
              href={resetLink}
              className="text-blue-600 font-medium break-all hover:underline"
            >
              {resetLink}
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
