import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Eye, EyeOff, ArrowLeft, Check, X, Moon, Sun } from "lucide-react";
import SDEverse from "../assets/sdeverse.png";
import { toast } from "react-toastify";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [isThemeChanging, setIsThemeChanging] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    hasLetter: false,
    hasNumber: false,
  });

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
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const newDarkMode = !isDark;
    setIsDark(newDarkMode);
    localStorage.setItem('sdeverse-theme', newDarkMode ? 'dark' : 'light');
    
    setIsThemeChanging(false);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    
    if (e.target.name === "password") {
      const pwd = e.target.value;
      setPasswordCriteria({
        minLength: pwd.length >= 6,
        hasLetter: /[a-zA-Z]/.test(pwd),
        hasNumber: /[0-9]/.test(pwd),
      });
    }
    
    if (validationErrors[e.target.name]) {
      setValidationErrors({ ...validationErrors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (formData.username.length < 3) {
      errors.username = "Username must be at least 3 characters long";
    } else if (formData.username.length > 20) {
      errors.username = "Username must be less than 20 characters";
    } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
      errors.username = "Username can only contain letters, numbers, and underscores";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (formData.password.length < 6) {
      errors.password = "Password must be at least 6 characters long";
    } else if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(formData.password)) {
      errors.password = "Password must contain at least one letter and one number";
    }

    return errors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    setValidationErrors({});
    dispatch(registerUser(formData));
  };

  const formatErrorMessage = (error) => {
    if (!error) return "";
    
    const errorString = error.message || error.toString();
    
    if (errorString.includes("E11000") && errorString.includes("username")) {
      return "This username is already taken. Please choose another one.";
    }
    
    if (errorString.includes("E11000") && errorString.includes("email")) {
      return "This email is already registered. Please use another email or login.";
    }
    
    if (errorString.includes("validation")) {
      return "Please check your input and try again.";
    }
    return errorString;
  };

  useEffect(() => {
    if (user) {
      toast.success("Successfully Registered")
      navigate("/");
    } 
  }, [user, navigate]);

  useEffect(()=>{
    if(error){
      toast.error("Error,Please try again")
    }
  } , [error])

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

  const inputVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.4 }
    }
  };

  const criteriaItemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3
      }
    })
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
          : 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #f3e8ff 100%)'
      }}
    >
      {/* Animated Background Blobs */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <motion.div
          variants={blobVariants}
          animate="animate"
          className="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl"
          style={{ backgroundColor: isDark ? '#1e40af' : '#93c5fd' }}
        />
        <motion.div
          variants={blobVariants}
          animate="animate"
          transition={{ delay: 2 }}
          className="absolute top-1/3 -left-1/4 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl"
          style={{ backgroundColor: isDark ? '#3730a3' : '#c7d2fe' }}
        />
        <motion.div
          variants={blobVariants}
          animate="animate"
          transition={{ delay: 4 }}
          className="absolute -bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full mix-blend-multiply filter blur-3xl"
          style={{ backgroundColor: isDark ? '#6b21a8' : '#e9d5ff' }}
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
        {/* Back Button */}
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
            Create your SDEverse account
          </motion.h2>
          <motion.p 
            style={{ color: isDark ? '#d1d5db' : '#6b7280' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-lg"
          >
            Start your coding journey today
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
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </motion.div>
                <span className="text-sm font-medium">{formatErrorMessage(error)}</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <motion.div
            variants={inputVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.5 }}
          >
            <label 
              className="block text-sm font-semibold mb-3 tracking-wide"
              style={{ color: isDark ? '#e5e7eb' : '#374151' }}
            >
              Username
            </label>
            <div className="relative group">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-4 rounded-xl border-2 transition-all duration-300 focus:ring-4 placeholder-gray-400 focus:outline-none group-hover:scale-[1.02]"
                style={{
                  background: isDark ? '#1f2937' : '#ffffff',
                  borderColor: validationErrors.username ? '#ef4444' : (isDark ? '#4b5563' : '#e5e7eb'),
                  color: isDark ? '#f9fafb' : '#1f2937',
                  boxShadow: isDark 
                    ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)'
                    : '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
                }}
                placeholder="Enter your username"
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            </div>
            <AnimatePresence>
              {validationErrors.username && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 text-sm font-medium"
                  style={{ color: '#ef4444' }}
                >
                  {validationErrors.username}
                </motion.p>
              )}
            </AnimatePresence>
            <motion.p 
              className="mt-2 text-xs"
              style={{ color: isDark ? '#9ca3af' : '#6b7280' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              3-20 characters, letters, numbers, and underscores only
            </motion.p>
          </motion.div>

          {/* Email Field */}
          <motion.div
            variants={inputVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.6 }}
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
                  borderColor: validationErrors.email ? '#ef4444' : (isDark ? '#4b5563' : '#e5e7eb'),
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
            <AnimatePresence>
              {validationErrors.email && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 text-sm font-medium"
                  style={{ color: '#ef4444' }}
                >
                  {validationErrors.email}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Password Field */}
          <motion.div
            variants={inputVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.7 }}
          >
            <label 
              className="block text-sm font-semibold mb-3 tracking-wide"
              style={{ color: isDark ? '#e5e7eb' : '#374151' }}
            >
              Password
            </label>
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
                  borderColor: validationErrors.password ? '#ef4444' : (isDark ? '#4b5563' : '#e5e7eb'),
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

            {/* Password Criteria */}
            <AnimatePresence>
              {formData.password && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 p-4 rounded-xl space-y-3 backdrop-blur-sm"
                  style={{
                    background: isDark 
                      ? 'linear-gradient(135deg, rgba(55, 65, 81, 0.6) 0%, rgba(31, 41, 55, 0.4) 100%)'
                      : 'linear-gradient(135deg, rgba(249, 250, 251, 0.8) 0%, rgba(243, 244, 246, 0.6) 100%)',
                    border: isDark 
                      ? '1px solid rgba(75, 85, 99, 0.3)'
                      : '1px solid rgba(229, 231, 235, 0.5)'
                  }}
                >
                  <motion.p 
                    className="text-xs font-semibold mb-3"
                    style={{ color: isDark ? '#e5e7eb' : '#374151' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Password requirements:
                  </motion.p>
                  
                  {[
                    { key: 'minLength', text: 'At least 6 characters', met: passwordCriteria.minLength },
                    { key: 'hasLetter', text: 'Contains at least one letter', met: passwordCriteria.hasLetter },
                    { key: 'hasNumber', text: 'Contains at least one number', met: passwordCriteria.hasNumber }
                  ].map((criteria, index) => (
                    <motion.div
                      key={criteria.key}
                      custom={index}
                      variants={criteriaItemVariants}
                      initial="hidden"
                      animate="visible"
                      className="flex items-center gap-3"
                    >
                      <motion.div
                        animate={criteria.met ? { scale: [1, 1.2, 1] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {criteria.met ? (
                          <Check className="w-4 h-4" style={{ color: '#10b981' }} />
                        ) : (
                          <X className="w-4 h-4" style={{ color: isDark ? '#6b7280' : '#9ca3af' }} />
                        )}
                      </motion.div>
                      <motion.span 
                        className="text-xs"
                        style={{ 
                          color: criteria.met ? '#10b981' : (isDark ? '#9ca3af' : '#6b7280'),
                          fontWeight: criteria.met ? '600' : '400'
                        }}
                        animate={criteria.met ? { x: [0, 2, 0] } : {}}
                        transition={{ duration: 0.3 }}
                      >
                        {criteria.text}
                      </motion.span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {validationErrors.password && (
                <motion.p 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-2 text-sm font-medium"
                  style={{ color: '#ef4444' }}
                >
                  {validationErrors.password}
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Create Account Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
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
                  <span>Creating account...</span>
                </motion.div>
              ) : (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Create account
                </motion.span>
              )}
            </motion.button>
          </motion.div>
        </form>

        {/* Sign In Link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="mt-8 text-center"
        >
          <p style={{ color: isDark ? '#d1d5db' : '#6b7280' }} className="text-base">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-semibold transition-all duration-300 hover:underline"
              style={{ color: isDark ? '#a5b4fc' : '#4f46e5' }}
            >
              Sign in
            </a>
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default Register;