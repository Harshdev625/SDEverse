import { useEffect, useState } from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { useDispatch } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import Layout from "./components/Layout";
import Loader from "./components/Loader";

import Home from "./pages/Home";
import Algorithms from "./pages/Algorithms";
import AlgorithmDetail from "./pages/AlgorithmDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import MoreInfoPage from "./pages/MoreInfoPage";
import Profile from "./pages/Profile";
import Feedback from "./pages/Feedback";
import CommunityGuidelines from "./pages/CommunityGuidelines";

import DataStructures from "./pages/DataStructures";
import DataStructureDetail from "./pages/DataStructureDetail";
import CreateDataStructureProposal from "./pages/CreateDataStructureProposal";
import EditDataStructureProposal from "./pages/EditDataStructureProposal";
import Sheets from "./pages/Sheets";
import SheetDetail from "./pages/SheetDetail";
import Blogs from "./pages/Blogs";
import BlogDetail from "./pages/BlogDetail";

import CreateProposal from "./pages/CreateProposal";
import EditProposal from "./pages/EditProposal";
import MyProposals from "./pages/MyProposals";

import AdminRoute from "./components/AdminRoute";
import AdminAlgorithms from "./pages/AdminAlgorithms";
import AdminProposalReview from "./pages/AdminProposalReview";
import AdminUsersPage from "./pages/AdminUsersPage";
import AdminAnalytics from "./pages/AdminAnalytics";
import AdminDataStructures from "./pages/AdminDataStructures";
import AdminDataStructureProposalReview from "./pages/AdminDataStructureProposalReview";
import AdminSheets from "./pages/AdminSheets";
import AdminSheetProposalReview from "./pages/AdminSheetProposalReview";
import MySheetProposals from "./pages/MySheetProposals";
import AdminBlogs from "./pages/AdminBlogs";
import { getMe } from "./features/auth/authSlice";
import { toast } from "react-toastify";


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
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "feedback", element: <Feedback /> },
      { path: "moreinfo/:platform", element: <MoreInfoPage /> },
      { path: "profile/:username", element: <Profile /> },

      { path: "algorithms", element: <Algorithms /> },
      { path: "algorithms/:slug", element: <AlgorithmDetail /> },
      { path: "algorithms/proposals/new", element: <CreateProposal /> },
      { path: "algorithms/proposals/:slug/edit", element: <EditProposal /> },
      { path: "algorithms/:slug/contribute", element: <CreateProposal /> },

      { path: "data-structures", element: <DataStructures /> },
      { path: "data-structures/:slug", element: <DataStructureDetail /> },
      { path: "data-structures/proposals/new", element: <CreateDataStructureProposal /> },
      { path: "data-structures/proposals/:slug/edit", element: <EditDataStructureProposal /> },

      { path: "proposals", element: <MyProposals /> },
      { path: "my/sheet-proposals", element: <MySheetProposals /> },
      { path: "community-guidelines", element: <CommunityGuidelines /> },

      { path: "sheets", element: <Sheets /> },
      { path: "sheets/:slug", element: <SheetDetail /> },

      { path: "blogs", element: <Blogs /> },
      { path: "blogs/:slug", element: <BlogDetail /> },

      { path: "admin/manage-algorithms", element: (<AdminRoute><AdminAlgorithms /></AdminRoute>) },
      { path: "admin/manage-data-structures", element: (<AdminRoute><AdminDataStructures /></AdminRoute>) },
      { path: "admin/proposals/review", element: (<AdminRoute><AdminProposalReview /></AdminRoute>) },
      { path: "admin/data-structures/proposals/review", element: (<AdminRoute><AdminDataStructureProposalReview /></AdminRoute>) },
      { path: "admin/sheets/proposals/review", element: (<AdminRoute><AdminSheetProposalReview /></AdminRoute>) },
      { path: "admin/manage-users", element: (<AdminRoute><AdminUsersPage /></AdminRoute>) },
      { path: "admin/analytics", element: (<AdminRoute><AdminAnalytics /></AdminRoute>) },
      { path: "admin/manage-sheets", element: (<AdminRoute><AdminSheets /></AdminRoute>) },
      { path: "admin/manage-blogs", element: (<AdminRoute><AdminBlogs /></AdminRoute>) },
    ],
  },
]);

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  useEffect(() => {
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