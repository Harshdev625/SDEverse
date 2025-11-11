import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { registerUser } from "../../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { Loader2, Eye, EyeOff, ArrowLeft, Check, X, LucideCalculator } from "lucide-react";
import SDEverse from "../../assets/sdeverse.png";
import { toast } from "react-toastify";
import { MdDarkMode } from "react-icons/md";
import { MdLightMode } from "react-icons/md";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [toggleMode, setToggleMode] = useState(()=>{
    const savedTheme = localStorage.getItem('register-theme')
 
    return savedTheme === 'dark'
  })
  const { loading, error, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [passwordCriteria, setPasswordCriteria] = useState({
    minLength: false,
    hasLetter: false,
    hasNumber: false,
  });

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
  useEffect(() => {
    if (toggleMode) {
      localStorage.setItem('register-theme' ,'dark')
    } else {
      localStorage.setItem('register-theme' ,'light')
    } 
  }, [toggleMode]);
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
  const handleModeChange = () => {
    setToggleMode(!toggleMode)
  }

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

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 dark:bg-none dark:bg-black ${toggleMode ? 'dark' : ''}`}
    >
      <button onClick={handleModeChange} className="absolute top-4 right-4 w-[50px] h-[50px] flex items-center justify-center z-20">
        {!toggleMode ? <MdDarkMode className="text-3xl" /> : <MdLightMode className="text-3xl text-white" />}
      </button>
      <div className="absolute inset-0 z-0 overflow-hidden dark:bg-black">
        <div className="absolute -top-1/4 -right-1/4 w-[500px] h-[500px] bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 -left-1/4 w-[500px] h-[500px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <Motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative z-10 max-w-md w-full bg-white/80 dark:bg-[#191A18] backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/30"
      >
        <Link to="/" className="p-1 rounded-sm border w-6 text-indigo-700 flex items-center hover:bg-indigo-700 hover:text-white dark:bg-transparent dark:text-white dark:hover:bg-white dark:hover:text-[#191A18]">
         <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="text-center mb-8">
          <Motion.div
            whileHover={{ scale: 1.05 }}
            className="mx-auto mb-4"
                    >
          
            <img
              src={SDEverse}
              alt="SDEverse Logo"
              className="w-20 h-20 mx-auto object-contain"
            />
          </Motion.div>
          <h2 className="text-3xl font-bold text-indigo-700 mb-2 dark:text-[#2C2CD4]">
            Create your SDEverse account
          </h2>
          <p className="text-gray-600 dark:text-white/80">Start your coding journey today</p>
        </div>

        {error && (
          <Motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-start gap-2"
          >
            <X className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{formatErrorMessage(error)}</span>
          </Motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white/80">
              Username
            </label>
            <div className="relative">
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 bg-white rounded-lg border dark:bg-[#697565] dark:placeholder-gray-100 ${
                  validationErrors.username ? "border-red-500" : "border-gray-300 "
                } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition`}
                placeholder="Enter your username"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400 dark:text-gray-800"
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
            {validationErrors.username && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.username}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">3-20 characters, letters, numbers, and underscores only</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white/80">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 bg-white rounded-lg border dark:bg-[#697565] dark:placeholder-gray-100 ${
                  validationErrors.email ? "border-red-500" : "border-gray-300"
                } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition`}
                placeholder="your.email@example.com"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400 dark:text-gray-800"
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
            {validationErrors.email && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-white/80">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className={`w-full px-4 py-3 bg-white rounded-lg border dark:bg-[#697565] dark:placeholder-gray-100 ${
                  validationErrors.password ? "border-red-500" : "border-gray-300"
                } focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-800" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 dark:text-gray-800" />
                )}
              </button>
            </div>
            
            {formData.password && (
              <Motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 bg-gray-50 rounded-lg space-y-2"
              >
                <p className="text-xs font-medium text-gray-700 mb-2">Password requirements:</p>
                
                <div className="flex items-center gap-2">
                  {passwordCriteria.minLength ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`text-xs ${passwordCriteria.minLength ? "text-green-600 font-medium" : "text-gray-600"}`}>
                    At least 6 characters
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {passwordCriteria.hasLetter ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`text-xs ${passwordCriteria.hasLetter ? "text-green-600 font-medium" : "text-gray-600"}`}>
                    Contains at least one letter
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  {passwordCriteria.hasNumber ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <X className="w-4 h-4 text-gray-400" />
                  )}
                  <span className={`text-xs ${passwordCriteria.hasNumber ? "text-green-600 font-medium" : "text-gray-600"}`}>
                    Contains at least one number
                  </span>
                </div>
              </Motion.div>
            )}
            
            {validationErrors.password && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.password}</p>
            )}
          </div>

          <Motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-indigo-200/50 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-white/80">
            Already have an account?{" "}
            <a
              href="/login"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-blue-500"
            >
              Sign in
            </a>
          </p>
        </div>
      </Motion.div>
    </Motion.div>
  );
};

export default Register;