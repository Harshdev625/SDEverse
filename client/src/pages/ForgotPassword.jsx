import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { 
  forgotPassword, 
  validateOTP, 
  resetPassword, 
  clearResetSuccess 
} from "../features/auth/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Eye, EyeOff, ArrowLeft, Mail, Lock, KeyRound } from "lucide-react";
import SDEverse from "../assets/sdeverse.png";

const ForgotPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, resetSuccess, otpSent, otpValidated } = useSelector(
    (state) => state.auth
  );

  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Step 1: Request OTP
  const handleRequestOTP = (e) => {
    e.preventDefault();
    setValidationError("");
    dispatch(forgotPassword({ email }));
  };

  // Step 2: Validate OTP
  const handleValidateOTP = (e) => {
    e.preventDefault();
    setValidationError("");
    dispatch(validateOTP({ email, code: otp }));
  };

  // Step 3: Reset Password
  const handleResetPassword = (e) => {
    e.preventDefault();
    setValidationError("");

    if (newPassword !== confirmPassword) {
      setValidationError("Passwords do not match");
      return;
    }

    dispatch(
      resetPassword({
        email,
        code: otp,
        newPassword,
        confirmPassword,
      })
    );
  };

  useEffect(() => {
    if (otpSent && step === 1) {
      const timer = setTimeout(() => {
        setStep(2);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [otpSent, step]);

  useEffect(() => {
    if (otpValidated && step === 2) {
      const timer = setTimeout(() => {
        setStep(3);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [otpValidated, step]);

  useEffect(() => {
    if (resetSuccess) {
      const timer = setTimeout(() => {
        navigate("/login");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [resetSuccess, navigate]);

  useEffect(() => {
    dispatch(clearResetSuccess());
    return () => {
      dispatch(clearResetSuccess());
    };
  }, [dispatch]);

  const goBack = () => {
    setValidationError("");
    dispatch(clearResetSuccess());
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleResendOTP = () => {
    setStep(1);
    setOtp("");
    setValidationError("");
    dispatch(clearResetSuccess());
  };

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
        {step === 1 ? (
          <Link
            to="/login"
            className="p-1 rounded-sm border w-6 text-indigo-700 flex items-center hover:bg-indigo-700 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
        ) : (
          <button
            onClick={goBack}
            className="p-1 rounded-sm border w-6 text-indigo-700 flex items-center hover:bg-indigo-700 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
        )}

        <div className="text-center mb-6">
          <motion.div whileHover={{ scale: 1.05 }} className="mx-auto mb-4">
            <img
              src={SDEverse}
              alt="SDEverse Logo"
              className="w-20 h-20 mx-auto object-contain"
            />
          </motion.div>
        </div>

        <div className="flex items-center justify-center mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                  step >= s
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`w-12 h-1 mx-2 transition-colors ${
                    step > s ? "bg-indigo-600" : "bg-gray-200"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-indigo-700 mb-2">
            {step === 1 && "Reset Your Password"}
            {step === 2 && "Verify OTP"}
            {step === 3 && "Set New Password"}
          </h2>
          <p className="text-gray-600">
            {step === 1 && "Enter your email to receive OTP"}
            {step === 2 && "Enter the 6-digit code sent to your email"}
            {step === 3 && "Create your new password"}
          </p>
        </div>

        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {validationError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm"
            >
              {validationError}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {otpSent && step === 1 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium"
            >
              OTP sent successfully
            </motion.div>
          )}
          {otpValidated && step === 2 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium"
            >
              OTP verified successfully
            </motion.div>
          )}
          {resetSuccess && step === 3 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg text-sm font-medium"
            >
              Password reset successful
            </motion.div>
          )}
        </AnimatePresence>

        {step === 1 && (
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleRequestOTP}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                  placeholder="your.email@example.com"
                />
                <Mail className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              </div>
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
                  Sending OTP...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-5 w-5" />
                  Send OTP
                </>
              )}
            </motion.button>
          </motion.form>
        )}

        {step === 2 && (
          <motion.form
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleValidateOTP}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                OTP Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={otp}
                  onChange={(e) =>
                    setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  required
                  maxLength={6}
                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition text-center text-2xl tracking-widest"
                  placeholder="000000"
                />
                <KeyRound className="absolute right-3 top-3 h-5 w-5 text-gray-400" />
              </div>
              <p className="mt-2 text-xs text-gray-500 text-center">
                OTP sent to {email}
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-medium shadow-lg hover:shadow-indigo-200/50 transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  <KeyRound className="mr-2 h-5 w-5" />
                  Verify OTP
                </>
              )}
            </motion.button>

            <button
              type="button"
              onClick={handleResendOTP}
              className="w-full text-sm text-indigo-600 hover:text-indigo-500 transition"
            >
              Resend OTP
            </button>
          </motion.form>
        )}

        {step === 3 && (
          <motion.form
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onSubmit={handleResetPassword}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-3"
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
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition"
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-3"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Password must be at least 6 characters with letters and numbers
              </p>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || resetSuccess}
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
          </motion.form>
        )}

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