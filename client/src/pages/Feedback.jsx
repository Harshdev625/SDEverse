import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiCheckCircle, FiAlertCircle, FiSend, FiChevronDown, FiInfo } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import { sendFeedback } from "../features/feedback/feedbackSlice";

const Feedback = () => {
  const [form, setForm] = useState({
    type: "bug",
    title: "",
    description: "",
    severity: "low",
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [localError, setLocalError] = useState(null);
  const dispatch = useDispatch();
  const { loading, success, error } = useSelector((state) => state.feedback);
  const themeMode = useSelector((state) => state.theme.mode);

  // Automatically collect device info on component mount
  useEffect(() => {
    const getDeviceInfo = () => {
      const { userAgent } = navigator;
      const screen = `${window.screen.width}x${window.screen.height}`;
      
      // Parse browser info
      let browser = "Unknown Browser";
      if (userAgent.includes("Chrome")) browser = "Chrome";
      else if (userAgent.includes("Firefox")) browser = "Firefox";
      else if (userAgent.includes("Safari")) browser = "Safari";
      else if (userAgent.includes("Edg")) browser = "Edge";
      
      // Parse OS info
      let os = "Unknown OS";
      if (userAgent.includes("Win")) os = "Windows";
      else if (userAgent.includes("Mac")) os = "macOS";
      else if (userAgent.includes("Linux")) os = "Linux";
      else if (userAgent.includes("Android")) os = "Android";
      else if (userAgent.includes("iOS")) os = "iOS";
      
      return `${browser} on ${os}, Screen: ${screen}`;
    };
    
    setForm(prev => ({
      ...prev,
      deviceInfo: getDeviceInfo(),
      pageUrl: window.location.href
    }));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (localError) setLocalError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Client-side validation
    if (!form.type || !form.title || !form.description) {
      setLocalError("Please select a feedback type, add a title, and enter a description");
      return;
    }
    
    // Prepare feedback data according to backend model
    const feedbackData = {
      type: form.type,
      title: form.title,
      description: form.description,
      severity: form.severity,
      pageUrl: form.pageUrl,
      deviceInfo: form.deviceInfo
    };
    
    dispatch(sendFeedback(feedbackData));
  };

  // Reset form on successful submission
  useEffect(() => {
    if (success) {
      setForm({
        type: "bug",
        title: "",
        description: "",
        severity: "low",
        deviceInfo: form.deviceInfo,
        pageUrl: form.pageUrl
      });
      
      // Scroll to top to see success message
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [success]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-indigo-50 dark:from-gray-900 dark:to-gray-950 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700"
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-600 opacity-10"></div>
            
            <div className="relative z-10 p-8">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Share Your Feedback</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">We value your thoughts and suggestions</p>
                </div>
                <div className="bg-gradient-to-r from-indigo-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center">
                  <FiSend className="text-white text-2xl" />
                </div>
              </div>
              
              <AnimatePresence>
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 mb-6 p-4 bg-green-900/30 rounded-xl border border-green-700/50"
                  >
                    <FiCheckCircle className="text-green-400 text-xl flex-shrink-0" />
                    <div>
                      <p className="font-medium text-green-300">Feedback submitted successfully!</p>
                      <p className="text-green-400 text-sm mt-1">Thank you for helping us improve</p>
                    </div>
                  </motion.div>
                )}
                
                {(error || localError) && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-3 mb-6 p-4 bg-red-900/30 rounded-xl border border-red-700/50"
                  >
                    <FiAlertCircle className="text-red-400 text-xl flex-shrink-0" />
                    <div>
                      <p className="font-medium text-red-300">Error submitting feedback</p>
                      <p className="text-red-400 text-sm mt-1">{error?.message || localError}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Feedback Type
                  </label>
                  <div className="relative">
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      required
                      className="w-full pl-4 pr-10 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 appearance-none text-gray-900 dark:text-white"
                    >
                      <option value="bug">🐞 Bug Report</option>
                      <option value="feature_request">✨ Feature Request</option>
                      <option value="ui_suggestion">🎨 UI/UX Feedback</option>
                      <option value="performance">⚡ Performance Issue</option>
                      <option value="general">📝 General Feedback</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-400">
                      <FiChevronDown />
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title
                  </label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    required
                    placeholder="Brief summary of your feedback..."
                    className="w-full p-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    required
                    placeholder="Detailed description of your feedback..."
                    rows={5}
                    className="w-full p-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl shadow-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Device Information
                    </label>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <FiInfo className="mr-1" /> auto-detected
                    </div>
                  </div>
                  <div className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 text-sm">
                    {form.deviceInfo || "Detecting your device..."}
                  </div>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Page URL
                    </label>
                  </div>
                  <div className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-700 dark:text-gray-300 text-sm truncate">
                    {form.pageUrl || window.location.href}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Severity Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: "low", label: "Low", color: "bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-200 border-indigo-300 dark:border-indigo-700" },
                      { value: "medium", label: "Medium", color: "bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-200 border-amber-300 dark:border-amber-700" },
                      { value: "high", label: "High", color: "bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-200 border-rose-300 dark:border-rose-700" },
                    ].map((severity) => (
                      <motion.div
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.98 }}
                        key={severity.value}
                        className={`relative rounded-xl cursor-pointer overflow-hidden border ${form.severity === severity.value ? "ring-2 ring-indigo-500 ring-opacity-50" : ""} ${severity.color}`}
                      >
                        <input
                          type="radio"
                          name="severity"
                          value={severity.value}
                          checked={form.severity === severity.value}
                          onChange={handleChange}
                          className="absolute opacity-0 w-0 h-0"
                          id={`severity-${severity.value}`}
                        />
                        <label
                          htmlFor={`severity-${severity.value}`}
                          className={`block text-center py-3 px-4 rounded-xl font-medium cursor-pointer`}
                        >
                          {severity.label}
                        </label>
                      </motion.div>
                    ))}
                  </div>
                </div>
                
                <div className="pt-4">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className={`w-full py-3.5 rounded-xl font-medium shadow-md transition-all ${
                      loading
                        ? "bg-gray-300 dark:bg-gray-700 cursor-not-allowed text-gray-500 dark:text-gray-400"
                        : "bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white"
                    }`}
                  >
                    <div className="flex items-center justify-center">
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <FiSend className="mr-2" />
                          Submit Feedback
                        </>
                      )}
                    </div>
                  </motion.button>
                </div>
              </form>
              
              <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button 
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center justify-between w-full text-left text-gray-600 dark:text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-300"
                >
                  <span className="font-medium">How we use your feedback</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FiChevronDown />
                  </motion.div>
                </button>
                
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-4 pb-2 text-gray-600 dark:text-gray-400">
                        <p className="mb-3">
                          We take your feedback seriously. Here's how we use it:
                        </p>
                        <ul className="space-y-2 list-disc pl-5">
                          <li>Bug reports help us identify and fix issues</li>
                          <li>Feature requests shape our product roadmap</li>
                          <li>UI/UX feedback improves user experience</li>
                          <li>Performance issues help us optimize the app</li>
                          <li>General feedback informs our strategic decisions</li>
                        </ul>
                        <p className="mt-4 text-sm">
                          Your information is kept confidential and never shared with third parties.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.div>
        
        <div className="mt-8 text-center text-gray-500 dark:text-gray-400 text-sm">
          <p>© 2025 SDEverse Feedback System. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Feedback;