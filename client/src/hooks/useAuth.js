import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const useAuth = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  const requireAuth = (callback) => {
    if (!isAuthenticated || !user) {
      toast.info("Please log in to continue");
      navigate("/login");
      return false;
    }
    callback?.();
    return true;
  };

  const requireAdmin = (callback) => {
    if (!isAuthenticated || user?.role !== "admin") {
      toast.error("Admin access required");
      navigate("/");
      return false;
    }
    callback?.();
    return true;
  };

  const isAdmin = user?.role === "admin";

  const isOwner = (resourceUserId) => {
    return user?._id === resourceUserId || user?.id === resourceUserId;
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    requireAuth,
    requireAdmin,
    isOwner,
  };
};
