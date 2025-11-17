import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { motion as Motion } from "framer-motion";
import { toast } from "react-toastify";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import SDEverse from "../../assets/sdeverse.png";
import { MdDarkMode } from "react-icons/md";
import { MdLightMode } from "react-icons/md";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [toggleMode, setToggleMode] = useState(()=>{
    const savedTheme = localStorage.getItem('login-theme')
 
    return savedTheme === 'dark'
  })

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };
  const handleModeChange = () => {
    setToggleMode(!toggleMode)
  }
  useEffect(() => {
    if (user) {
      toast.success("Login successful!");
      navigate("/");
    }
  }, [user, navigate]);
  useEffect(() => {
    if (toggleMode) {
      localStorage.setItem('login-theme' ,'dark')
    } else {
      localStorage.setItem('login-theme' ,'light')
    } 
  }, [toggleMode]);

  useEffect(() => {
    if (error) {
      toast.error("Invalid email or password");
    }
  }, [error]);

  return (
    <Motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 ${toggleMode ? 'dark' : ''} dark:from-black dark:via-gray-900 dark:to-black` }
    >
      <button onClick={handleModeChange} className="absolute top-4 right-4 w-[50px] h-[50px] flex items-center justify-center z-20">
        {!toggleMode ? <MdDarkMode className="text-3xl" /> : <MdLightMode className="text-3xl text-white" />}
      </button>
      <div className="absolute inset-0 z-0 overflow-hidden" style={{ display: toggleMode ? 'none' : 'block' }}>
        <div className="absolute -top-1/4 -left-1/4 w-[500px] h-[500px] bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-1/3 -right-1/4 w-[500px] h-[500px] bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-1/4 left-1/4 w-[500px] h-[500px] bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <Motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative z-10 max-w-md w-full bg-white/80 dark:bg-gray-900 backdrop-blur-lg rounded-2xl shadow-xl p-8 border border-white/30"
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
          <h2 className="text-3xl font-bold text-indigo-700 dark:text-[#2C2CD4] mb-2">
            Welcome back to SDEverse
          </h2>
          <p className="text-gray-600 dark:text-white">Sign in to continue your journey</p>
        </div>

        {error && (
          <Motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm"
          >
            {error.message || error}
          </Motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-indigo-400 mb-2">
              Email
            </label>
            <div className="relative">
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 dark:placeholder-gray-400 rounded-lg border border-gray-300 dark:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition"
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
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-indigo-400">
                Password
              </label>
              <a
                href="/forgot-password"
                className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-blue-500"
              >
                Forgot password?
              </a>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 dark:placeholder-gray-400 rounded-lg border border-gray-300 dark:border-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 "
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 dark:text-gray-800" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 dark:text-gray-800" />
                )}
              </button>
            </div>
          </div>

          <Motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-indigo-200/50 transition-all duration-300 flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login to your account"
            )}
          </Motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Don't have an account?{" "}
            <a
              href="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-blue-500"
            >
              Sign up
            </a>
          </p>
        </div>
      </Motion.div>
    </Motion.div>
  );
};

export default Login;