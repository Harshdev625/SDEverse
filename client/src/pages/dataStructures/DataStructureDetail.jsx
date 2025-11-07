import { useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDataStructureBySlug,
  voteOnDataStructure,
  clearDataStructure,
} from "../../features/dataStructure/dataStructureSlice";
import Loader from "../../components/Loader";
import DataStructurePreview from "../../components/preview/DataStructurePreview";
import CommentSection from "../shared/CommentSection";
import { ArrowLeft, ArrowRight, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";
import { motion as Motion } from "framer-motion";
import { toast } from "react-toastify";
import clsx from "clsx";

const DataStructureDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { dataStructure, singleDataStructureLoading, error } = useSelector(
    (state) => state.dataStructure
  );

  useEffect(() => {
    if (slug) {
      dispatch(fetchDataStructureBySlug(slug));
    }
    return () => {
      dispatch(clearDataStructure());
    };
  }, [slug, dispatch]);

  const handleVote = useCallback(
    (type) => {
      if (!user) {
        toast.info("Please log in to vote.", { autoClose: 3000 });
        return;
      }
      if (!dataStructure) return;
      dispatch(
        voteOnDataStructure({
          slug: dataStructure.slug,
          voteData: { type },
        })
      );
    },
    [user, dataStructure, dispatch]
  );

  const currentUserVoteType = useCallback(() => {
    if (!user || !dataStructure) return null;
    if (dataStructure.upvotedBy?.includes(user._id)) return "upvote";
    if (dataStructure.downvotedBy?.includes(user._id)) return "downvote";
    return null;
  }, [user, dataStructure])();

  const handleContribute = useCallback(() => {
    if (!user) {
      toast.info("Please log in to contribute.", { autoClose: 3000 });
      return;
    }
    navigate(`/data-structures/proposals/${dataStructure.slug}/edit`);
  }, [user, dataStructure, navigate]);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  if (singleDataStructureLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4">
        <div className="bg-red-50 dark:bg-red-900/30 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 p-6 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Something Went Wrong</h2>
          <p className="mb-6 text-sm">{error || "Unable to load data structure."}</p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all shadow-md"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  if (!dataStructure && !singleDataStructureLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-200 p-6 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Data Structure Not Found</h2>
          <p className="mb-6 text-sm">
            The requested data structure could not be found.
          </p>
          <button
            onClick={() => navigate("/data-structures")}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md"
          >
            Browse Data Structures
          </button>
        </div>
      </div>
    );
  }

  return (
    <Motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 text-gray-900 dark:text-gray-100"
    >
      <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between max-w-7xl">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-all text-sm"
            aria-label="Go back"
          >
            <ArrowLeft size={20} />
            <span className="hidden md:inline">Back</span>
          </button>
          <h1 className="text-lg md:text-xl lg:text-2xl font-bold truncate max-w-[60%] text-center">
            {dataStructure.title}
          </h1>
          <button
            onClick={() => navigate(1)}
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-all text-sm"
            aria-label="Go forward"
          >
            <span className="hidden md:inline">Forward</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl space-y-8">
        <section className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <DataStructurePreview dataStructure={dataStructure} />
        </section>

        <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleVote("upvote")}
                className={clsx(
                  "flex items-center gap-2 px-5 py-2 rounded-full shadow-md transition-all",
                  currentUserVoteType === "upvote"
                    ? "bg-green-600 text-white"
                    : "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900"
                )}
              >
                <ThumbsUp
                  size={20}
                  className={clsx(currentUserVoteType === "upvote" && "fill-current")}
                />
                <span className="font-semibold">{dataStructure.upvotes || 0}</span>
              </Motion.button>
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleVote("downvote")}
                className={clsx(
                  "flex items-center gap-2 px-5 py-2 rounded-full shadow-md transition-all",
                  currentUserVoteType === "downvote"
                    ? "bg-red-600 text-white"
                    : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900"
                )}
              >
                <ThumbsDown
                  size={20}
                  className={clsx(currentUserVoteType === "downvote" && "fill-current")}
                />
                <span className="font-semibold">{dataStructure.downvotes || 0}</span>
              </Motion.button>
            </div>

            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleContribute}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white font-medium shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all"
            >
              <Sparkles size={20} />
              <span>Contribute</span>
            </Motion.button>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <CommentSection
            parentType="DataStructure"
            parentId={dataStructure._id}
            parentSlug={dataStructure.slug}
          />
        </section>
      </main>
    </Motion.div>
  );
};

export default DataStructureDetail;
