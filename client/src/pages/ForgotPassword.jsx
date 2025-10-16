import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendResetEmail, clearState } from "../redux/slices/resetPasswordSlice";
import { useNavigate } from "react-router-dom";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { loading, success, error, message } = useSelector(
    (state) => state.resetPassword
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    dispatch(sendResetEmail(email));
  };

  useEffect(() => {
    if (success) {
      // Redirect to Reset Password page with temporary token
      const token = "123456abcdef";
      navigate(`/reset-password/${token}`);
      dispatch(clearState());
    }
  }, [success, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            {loading ? "Sending..." : "Submit"}
          </button>
          {error && <p className="text-red-400 text-center mt-2">{error}</p>}
          {message && <p className="text-green-400 text-center mt-2">{message}</p>}
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
