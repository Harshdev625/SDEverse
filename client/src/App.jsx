import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { setTheme } from "./features/theme/themeSlice";

import Layout from "./components/Layout";
import Loader from "./components/Loader";

import Home from "./pages/public/Home";
import Login from "./pages/public/Login";
import Register from "./pages/public/Register";
import ForgotPassword from "./pages/public/ForgotPassword";
import Contact from "./pages/public/Contact";
import CommunityGuidelines from "./pages/public/CommunityGuidelines";
import FaqPage from './pages/public/FaqPage';

import Algorithms from "./pages/algorithms/Algorithms";
import AlgorithmDetail from "./pages/algorithms/AlgorithmDetails";
import CreateProposal from "./pages/algorithms/CreateProposal";
import EditProposal from "./pages/algorithms/EditProposal";
import MyProposals from "./pages/algorithms/MyProposals";

import DataStructures from "./pages/dataStructures/DataStructures";
import DataStructureDetail from "./pages/dataStructures/DataStructureDetail";
import CreateDataStructureProposal from "./pages/dataStructures/CreateDataStructureProposal";
import EditDataStructureProposal from "./pages/dataStructures/EditDataStructureProposal";

import Profile from "./pages/profile/Profile";
import MoreInfoPage from "./pages/profile/MoreInfoPage";

import Feedback from "./pages/shared/Feedback";

import AdminRoute from "./components/AdminRoute";
import AdminAlgorithms from "./pages/admin/AdminAlgorithms";
import AdminProposalReview from "./pages/admin/AdminProposalReview";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminDataStructures from "./pages/admin/AdminDataStructures";
import AdminDataStructureProposalReview from "./pages/admin/AdminDataStructureProposalReview";
import AdminUsersContact from "./pages/admin/AdminUsersContact";
import AdminProblemSheets from "./pages/admin/AdminProblemSheets";
import AdminProblemManagement from "./pages/admin/AdminProblemManagement";

import { getMe } from "./features/auth/authSlice";
import { toast } from "react-toastify";

import Blogs from "./pages/blogs/Blogs";
import BlogDetail from "./pages/blogs/BlogDetail";
import CreateBlog from "./pages/blogs/CreateBlog";
import EditBlog from "./pages/blogs/EditBlog";
import MyBlogs from "./pages/blogs/MyBlogs";
import AdminBlogReview from "./pages/admin/AdminBlogReview";

import ProblemSheets from "./pages/sheets/ProblemSheets";
import SheetDetail from "./pages/sheets/SheetDetail";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/register",
    element: <Register />,
  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
       {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "feedback",
        element: <Feedback />,
      },
      {
        path: "moreinfo/:platform",
        element: <MoreInfoPage />,
      },
      {
        path: "profile/:username",
        element: <Profile />,
      },
      {
        path: "algorithms",
        element: <Algorithms />,
      },
      {
        path: "algorithms/:slug",
        element: <AlgorithmDetail />,
      },
      {
        path: "algorithms/proposals/new",
        element: <CreateProposal />,
      },
      {
        path: "algorithms/proposals/:slug/edit",
        element: <EditProposal />,
      },
      {
        path: "algorithms/:slug/contribute",
        element: <CreateProposal />,
      },
      {
        path: "data-structures",
        element: <DataStructures />,
      },
      {
        path: "data-structures/:slug",
        element: <DataStructureDetail />,
      },
      {
        path: "data-structures/proposals/new",
        element: <CreateDataStructureProposal />,
      },
      {
        path: "data-structures/proposals/:slug/edit",
        element: <EditDataStructureProposal />,
      },
      {
        path: "proposals",
        element: <MyProposals />,
      },
      {
        path: "community-guidelines",
        element: <CommunityGuidelines />,
      },
      {
        path: "problem-sheets",
        element: <ProblemSheets />,
      },
      {
        path: "problem-sheets/:sheetId",
        element: <SheetDetail />,
      },
      {
        path: "admin/manage-algorithms",
        element: (
          <AdminRoute>
            <AdminAlgorithms />
          </AdminRoute>
        ),
      },
      {
        path: "admin/manage-problem-sheets",
        element: (
          <AdminRoute>
            <AdminProblemSheets />
          </AdminRoute>
        ),
      },
      {
        path: "admin/manage-problem-sheets/:sheetId",
        element: (
          <AdminRoute>
            <AdminProblemManagement />
          </AdminRoute>
        ),
      },
      {
        path: "admin/manage-data-structures",
        element: (
          <AdminRoute>
            <AdminDataStructures />
          </AdminRoute>
        ),
      },
      {
        path: "admin/manage-users-contacts",
        element: (
          <AdminRoute>
            <AdminUsersContact />
          </AdminRoute>
        ),
      },
      {
        path: "admin/proposals/review",
        element: (
          <AdminRoute>
            <AdminProposalReview />
          </AdminRoute>
        ),
      },
      {
        path: "admin/data-structures/proposals/review",
        element: (
          <AdminRoute>
            <AdminDataStructureProposalReview />
          </AdminRoute>
        ),
      },
      {
        path: "admin/manage-users",
        element: (
          <AdminRoute>
            <AdminUsersPage />
          </AdminRoute>
        ),
      },
      {
        path: "admin/analytics",
        element: (
          <AdminRoute>
            <AdminAnalytics />
          </AdminRoute>
        ),
      },
      {
        path: "faq",
        element: <FaqPage />,
      },
      {
        path: "blogs",
        element: <Blogs />,
      },
      {
        path: "blogs/new",
        element: <CreateBlog />,
      },
      {
        path: "my-posts",
        element: <MyBlogs />,
      },
      {
        path: "blogs/:slug",
        element: <BlogDetail />,
      },
      {
        path: "blogs/:slug/edit",
        element: <EditBlog />,
      },
      {
        path: "admin/blogs/review",
        element: (
          <AdminRoute>
            <AdminBlogReview />
          </AdminRoute>
        ),
      },
    ],
  },
]);

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
    // Initialize theme on app startup
    const storedTheme = localStorage.getItem("theme") || "light";
    // console.log("Initializing theme with:", storedTheme);
    dispatch(setTheme(storedTheme));

    const fetchUser = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          await dispatch(getMe(token)).unwrap();
        } catch (error) {
          console.error("User authentication failed:", error);
          toast.error("Failed to authenticate user. Please log in again.", {
            position: "top-right",
            autoClose: 3000,
            theme: "colored",
          });
        }
      }
      setIsLoading(false);
    };

    fetchUser();
  }, [dispatch]);

  return isLoading ? (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="text-center">
        <Loader />
        <p className="mt-4 text-gray-600 dark:text-gray-300 text-lg font-medium">
          Loading your experience...
        </p>
      </div>
    </div>
  ) : (
    <>
      <RouterProvider router={router} />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
        toastClassName="rounded-lg shadow-lg"
        bodyClassName="text-sm font-medium"
      />
    </>
  );
}

export default App;