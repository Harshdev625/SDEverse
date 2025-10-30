import { Link } from "react-router-dom";
import { Home, Users, BookOpen, User, FileText } from "lucide-react";
import { useSelector } from "react-redux";

const NavLinks = ({ onClick }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <nav className="flex flex-col gap-4 text-gray-700 dark:text-gray-200">
      <Link to="/" onClick={onClick} className="flex items-center gap-2 hover:text-blue-600">
        <Home size={20} /> Home
      </Link>

      <Link to="/algorithms" onClick={onClick} className="flex items-center gap-2 hover:text-blue-600">
        <BookOpen size={20} /> Algorithms
      </Link>

      <Link to="/blogs" onClick={onClick} className="flex items-center gap-2 hover:text-blue-600">
        <FileText size={20} /> Blogs
      </Link>

      {user?.role === "admin" && (
        <>
          <Link to="/admin/manage-users" onClick={onClick} className="flex items-center gap-2 hover:text-blue-600">
            <Users size={20} /> Manage Users
          </Link>
          <Link to="/admin/manage-algorithms" onClick={onClick} className="flex items-center gap-2 hover:text-blue-600">
            <BookOpen size={20} /> Manage Algorithms
          </Link>
          <Link to="/admin/review-contributions" onClick={onClick} className="flex items-center gap-2 hover:text-blue-600">
            <BookOpen size={20} /> Review Contributions
          </Link>
        </>
      )}

      {user && user.role !== "admin" && (
        <>
          <Link to="/profile" onClick={onClick} className="flex items-center gap-2 hover:text-blue-600">
            <User size={20} /> Profile
          </Link>
          <Link to="/my-contributions" onClick={onClick} className="flex items-center gap-2 hover:text-blue-600">
            <BookOpen size={20} /> My Contributions
          </Link>
        </>
      )}

      {!user && (
        <>
          <Link to="/login" onClick={onClick} className="hover:text-blue-600">Login</Link>
          <Link to="/register" onClick={onClick} className="hover:text-blue-600">Register</Link>
        </>
      )}
    </nav>
  );
};

export default NavLinks;
