import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { Loader2, Eye, EyeOff, ArrowLeft, Moon, Sun } from "lucide-react";
import SDEverse from "../assets/sdeverse.png";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isThemeChanging, setIsThemeChanging] = useState(false);

  // Theme initialization
  useEffect(() => {
    const savedTheme = localStorage.getItem('sdeverse-theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      setIsDark(true);
    }
  }, []);

  const toggleTheme = async () => {
    setIsThemeChanging(true);
    
    // Add a small delay for smooth transition
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem('sdeverse-theme', newDarkMode ? 'dark' : 'light');
    
    setIsThemeChanging(false);
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  useEffect(() => {
    if (user) {
      toast.success("Login successful!");
      navigate("/");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (error) {
      toast.error("Invalid email or password");
    }
  }, [error]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.6, ease: "easeOut" }
    }
  };

  const cardVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { duration: 0.5, delay: 0.2, ease: "easeOut" }
    }
  };

  const themeButtonVariants = {
    initial: { scale: 1, rotate: 0 },
    hover: { scale: 1.1, rotate: 5 },
    tap: { scale: 0.9 },
    changing: { scale: 0.8, rotate: 180 }
  };

  const blobVariants = {
    animate: {
      scale: [1, 1.1, 1],
      opacity: [0.3, 0.4, 0.3],
      transition: {
        duration: 7,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen flex items-center justify-center p-4 transition-colors duration-500"
      style={{
        background: isDark 
          ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #581c87 100%)'
          : 'linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 50%, #fce7f3 100%)'
      }}
    >
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          variants={blobVariants}
          animate="animate"
          className="absolute -top-1/4 -left-1/4 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl animate-blob"
          style={{ backgroundColor: isDark ? '#3730a3' : '#c7d2fe' }}
        />
        <motion.div
          variants={blobVariants}
          animate="animate"
          transition={{ delay: 2 }}
          className="absolute top-1/3 -right-1/4 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl animate-blob"
          style={{ backgroundColor: isDark ? '#6b21a8' : '#e9d5ff' }}
        />
        <motion.div
          variants={blobVariants}
          animate="animate"
          transition={{ delay: 4 }}
          className="absolute -bottom-1/4 left-1/4 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl animate-blob"
          style={{ backgroundColor: isDark ? '#9d174d' : '#fbcfe8' }}
        />
      </div>

      {/* Enhanced Theme Toggle Button */}
      <motion.button
        variants={themeButtonVariants}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
        animate={isThemeChanging ? "changing" : "initial"}
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-20 p-3 rounded-2xl backdrop-blur-lg border-2 shadow-2xl transition-all duration-300 group"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(31, 41, 55, 0.9) 0%, rgba(55, 65, 81, 0.9) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(243, 244, 246, 0.9) 100%)',
          borderColor: isDark ? 'rgba(99, 102, 241, 0.3)' : 'rgba(199, 210, 254, 0.5)',
          color: isDark ? '#e5e7eb' : '#374151'
        }}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        disabled={isThemeChanging}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isDark ? 'sun' : 'moon'}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative"
          >
            {isDark ? (
              <Sun className="w-6 h-6" />
            ) : (
              <Moon className="w-6 h-6" />
            )}
          </motion.div>
        </AnimatePresence>
        
        {/* Glow effect */}
        <div 
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm -z-10"
          style={{
            background: isDark 
              ? 'radial-gradient(circle, rgba(251, 191, 36, 0.3) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, transparent 70%)'
          }}
        />
      </motion.button>

      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-md w-full backdrop-blur-xl rounded-3xl shadow-2xl p-8 transition-all duration-500"
        style={{
          background: isDark 
            ? 'linear-gradient(135deg, rgba(31, 41, 55, 0.85) 0%, rgba(55, 65, 81, 0.85) 100%)'
            : 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(248, 250, 252, 0.85) 100%)',
          border: isDark 
            ? '1px solid rgba(99, 102, 241, 0.2)' 
            : '1px solid rgba(255, 255, 255, 0.4)',
          boxShadow: isDark
            ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
            : '0 25px 50px -12px rgba(99, 102, 241, 0.15)'
        }}
      >
        {/* Back Button with enhanced styling */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Link 
            to="/" 
            className="p-2 rounded-xl border-2 flex items-center w-10 hover:scale-105 transition-all duration-300 group mb-6"
            style={{
              background: isDark 
                ? 'rgba(55, 65, 81, 0.5)'
                : 'rgba(255, 255, 255, 0.5)',
              borderColor: isDark ? '#4b5563' : '#e5e7eb',
              color: isDark ? '#a5b4fc' : '#4f46e5'
            }}
          >
            <ArrowLeft className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
          </Link>
        </motion.div>

        <div className="text-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mx-auto mb-6"
          >
            <img
              src={SDEverse}
              alt="SDEverse Logo"
              className="w-24 h-24 mx-auto object-contain drop-shadow-lg"
            />
          </motion.div>
          <motion.h2 
            className="text-4xl font-bold mb-3 bg-gradient-to-r bg-clip-text text-transparent"
            style={{
              backgroundImage: isDark
                ? 'linear-gradient(135deg, #a5b4fc 0%, #c4b5fd 50%, #f0abfc 100%)'
                : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #c026d3 100%)'
            }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            Welcome back to SDEverse
          </motion.h2>
          <motion.p 
            style={{ color: isDark ? '#d1d5db' : '#6b7280' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg"
          >
            Sign in to continue your journey
          </motion.p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="mb-6 p-4 rounded-xl border-l-4 backdrop-blur-sm"
              style={{
                background: isDark 
                  ? 'linear-gradient(135deg, rgba(220, 38, 38, 0.15) 0%, rgba(185, 28, 28, 0.1) 100%)'
                  : 'linear-gradient(135deg, rgba(254, 226, 226, 0.8) 0%, rgba(254, 202, 202, 0.6) 100%)',
                borderLeftColor: isDark ? '#fca5a5' : '#dc2626',
                color: isDark ? '#fca5a5' : '#dc2626'
              }}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 rounded-full bg-current animate-pulse" />
                </div>
                <span className="text-sm font-medium">{error.message || error}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            <label 
              className="block text-sm font-semibold mb-3 tracking-wide"
              style={{ color: isDark ? '#e5e7eb' : '#374151' }}
            >
              Email Address
            </label>
            <div className="relative group">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-4 placeholder-gray-400 focus:outline-none group-hover:scale-[1.02]"
                style={{
                  background: isDark ? '#1f2937' : '#ffffff',
                  borderColor: isDark ? '#4b5563' : '#e5e7eb',
                  color: isDark ? '#f9fafb' : '#1f2937',
                  boxShadow: isDark 
                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}
                placeholder="your.email@example.com"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 transition-colors duration-300"
                  style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
          </motion.div>

          {/* Password Field */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex items-center justify-between mb-3">
              <label 
                className="block text-sm font-semibold tracking-wide"
                style={{ color: isDark ? '#e5e7eb' : '#374151' }}
              >
                Password
              </label>
              <a
                href="/forgot-password"
                className="text-sm font-medium transition-all duration-300 hover:underline"
                style={{ color: isDark ? '#a5b4fc' : '#4f46e5' }}
              >
                Forgot password?
              </a>
            </div>
            <div className="relative group">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-4 placeholder-gray-400 focus:outline-none group-hover:scale-[1.02]"
                style={{
                  background: isDark ? '#1f2937' : '#ffffff',
                  borderColor: isDark ? '#4b5563' : '#e5e7eb',
                  color: isDark ? '#f9fafb' : '#1f2937',
                  boxShadow: isDark 
                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}
                placeholder="••••••••"
              />
              <motion.button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-4 transition-all duration-300 hover:scale-110"
                style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </motion.button>
            </div>
          </motion.div>

          {/* Login Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <motion.button
              whileHover={{ 
                scale: 1.02,
                boxShadow: isDark
                  ? '0 20px 25px -5px rgba(99, 102, 241, 0.3), 0 10px 10px -5px rgba(99, 102, 241, 0.2)'
                  : '0 20px 25px -5px rgba(99, 102, 241, 0.2), 0 10px 10px -5px rgba(99, 102, 241, 0.1)'
              }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)'
                  : 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #9333ea 100%)',
                color: '#ffffff'
              }}
            >
              {/* Animated background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Logging in...</span>
                </motion.div>
              ) : (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Login to your account
                </motion.span>
              )}
            </motion.button>
          </motion.div>
        </form>

        {/* Sign Up Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p style={{ color: isDark ? '#d1d5db' : '#6b7280' }} className="text-base">
            Don't have an account?{" "}
            <a
              href="/register"
              className="font-semibold transition-all duration-300 hover:underline"
              style={{ color: isDark ? '#a5b4fc' : '#4f46e5' }}
            >
              Sign up
            </a>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Login;