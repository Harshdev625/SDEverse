import { useState, useEffect, use } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, clearResetSuccess } from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2, Eye, EyeOff, ArrowLeft, Mail, Lock } from "lucide-react";
import SDEverse from "../assets/sdeverse.png";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, resetSuccess } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ 
    email: "", 
    newPassword: "", 
    confirmPassword: "" 
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate passwords match or add any other validation
    if (formData.newPassword !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    
    dispatch(resetPassword(formData));
  };

  useEffect(() => {
    let timer;
    if (resetSuccess) {
      timer = setTimeout(() => {
        navigate("/login");
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [resetSuccess, navigate]);

  useEffect(() => {
    return () => {
      dispatch(clearResetSuccess());
    };
  }, [dispatch]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4"
    >
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-1/4 -left-1/4 w-[500px] h-[500px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 -right-1/4 w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-1/4 left-1/4 w-[500px] h-[500px] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative z-10 max-w-md w-full bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/30"
      >
        <Link 
          to="/login" 
          className="p-1 rounded-sm border w-6 text-indigo-700 flex items-center hover:bg-indigo-700 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="mx-auto mb-4"
          >
            <img
              src={SDEverse}
              alt="SDEverse Logo"
              className="w-20 h-20 mx-auto object-contain"
            />
          </motion.div>
          <h2 className="text-3xl font-bold text-indigo-700 mb-2">
            Reset Your Password
          </h2>
          <p className="text-gray-600">Enter your email and new password</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm"
          >
            {error.message || error}
          </motion.div>
        )}

        {resetSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-green-50 text-green-700 rounded-lg text-sm"
          >
            Password reset successful! Redirecting to login...
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition"
                placeholder="your.email@example.com"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showNewPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Password must be at least 6 characters
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-indigo-200/50 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Resetting Password...
              </>
            ) : (
              <>
                <Lock className="mr-2 h-5 w-5" />
                Reset Password
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Remember your password?{" "}
            <Link
              to="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Back to Login
            </Link>
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ForgotPassword;