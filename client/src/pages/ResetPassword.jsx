import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetPassword, clearState } from "../redux/slices/resetPasswordSlice";
import { useParams, useNavigate } from "react-router-dom";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token } = useParams();

  const { loading, success, error, message } = useSelector(
    (state) => state.resetPassword
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!password.trim()) return;
    dispatch(resetPassword({ token, password }));
  };

  useEffect(() => {
    if (success) {
      navigate("/login");
      dispatch(clearState());
    }
  }, [success, message, navigate, dispatch]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 px-4">
      <div className="w-full max-w-md bg-gray-800 p-8 rounded-2xl shadow-lg">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Reset Password</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="password"
              placeholder="Enter new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-900 border border-gray-700 text-white"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
          {error && <p className="text-red-400 text-center mt-2">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
