import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAlgorithmBySlug,
  voteOnAlgorithm,
} from "../features/algorithm/algorithmSlice";
import Loader from "../components/Loader";
import AlgorithmPreview from "./AlgorithmPreview";
import CommentSection from "./CommentSection";
import {
  ArrowLeft,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import BookmarkButton from "../components/ui/BookmarkButton";

const AlgorithmDetail = () => {
  const { slug } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { algorithm, loading, error } = useSelector((state) => state.algorithm);

  useEffect(() => {
    if (slug) {
      dispatch(fetchAlgorithmBySlug(slug));
    }
  }, [slug, dispatch]);

  const handleVote = (type) => {
    if (!user) {
      toast.info("You must be logged in to vote.");
      return;
    }
    if (!algorithm?.slug) return;
    dispatch(voteOnAlgorithm({ slug: algorithm.slug, voteData: { type } }));
  };

  const currentUserVoteType = (() => {
    if (!user || !algorithm) return null;
    if (algorithm.upvotedBy?.includes(user._id)) return "upvote";
    if (algorithm.downvotedBy?.includes(user._id)) return "downvote";
    return null;
  })();

  const handleContribute = () => {
    if (!user) {
      toast.info("You must be logged in to contribute.");
      return;
    }
    navigate(`/algorithms/${algorithm.slug}/contribute`);
  };

  if (loading)
    return (
      <div className="flex h-full items-center justify-center">
        <Loader />
      </div>
    );

  if (error)
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-6 py-4 rounded-lg shadow-md text-center max-w-lg w-full">
          <p className="text-xl font-semibold mb-3">Oops! An error occurred.</p>
          <p className="text-base mb-4">
            {error.message || "Failed to load algorithm details."}
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors shadow-md"
          >
            Go to Home
          </button>
        </div>
      </div>
    );

  if (!algorithm)
    return (
      <div className="flex h-full items-center justify-center p-4">
        <div className="bg-blue-100 dark:bg-blue-900/20 border border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-6 py-4 rounded-lg shadow-md text-center max-w-lg w-full">
          <p className="text-xl font-semibold mb-3">No algorithm found.</p>
          <p className="text-base mb-4">
            The requested algorithm could not be found or may have been removed.
          </p>
          <button
            onClick={() => navigate("/algorithms")}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-md"
          >
            Browse Algorithms
          </button>
        </div>
      </div>
    );


  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="w-full"
    >
      {/* The sticky header can stay as is, but it's part of the page flow */}
      <header className="sticky top-0 z-10 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-md mb-8">
        <div className="flex justify-between items-center h-14 px-4">
           <button
             onClick={() => navigate(-1)}
             className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all text-sm"
             title="Go Back"
           >
             <ArrowLeft size={18} />
             <span className="hidden sm:inline">Back</span>
           </button>
           <h1 className="text-lg sm:text-xl font-semibold truncate text-center">
             {algorithm.title}
           </h1>
           <button
             onClick={() => navigate(1)}
             className="flex items-center gap-2 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-all text-sm"
             title="Go Forward"
           >
             <span className="hidden sm:inline">Forward</span>
             <ArrowRight size={18} />
           </button>
         </div>
       </header>

      {/* KEY CHANGE: This is now a simple div. 
        It does NOT use `container`, `mx-auto`, or `px-*` classes. 
        It naturally fills the space provided by the parent `Layout.js`.
      */}
      <div className="space-y-10">
        {/* Algorithm Preview */}
        <section className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <AlgorithmPreview algorithm={algorithm} />
        </section>

        {/* Voting and Contribute Buttons */}
        <section className="flex flex-col sm:flex-row items-center justify-center gap-6 p-4 rounded-xl bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
          {/* Voting Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => handleVote("upvote")}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-green-100 hover:bg-green-200 dark:bg-green-900/40 dark:hover:bg-green-900 text-green-700 dark:text-green-300 shadow-md transition-all duration-200 transform hover:scale-105"
            >
              <ThumbsUp
                size={20}
                className={
                  currentUserVoteType === "upvote" ? "fill-current" : ""
                }
              />
              <span className="font-semibold text-base">
                {algorithm.upvotes || 0}
              </span>
            </button>
            <button
              onClick={() => handleVote("downvote")}
              className="flex items-center gap-2 px-5 py-2 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900/40 dark:hover:bg-red-900 text-red-700 dark:text-red-300 shadow-md transition-all duration-200 transform hover:scale-105"
            >
              <ThumbsDown
                size={20}
                className={
                  currentUserVoteType === "downvote" ? "fill-current" : ""
                }
              />
              <span className="font-semibold text-base">
                {algorithm.downvotes || 0}
              </span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-4 sm:mt-0">
            <BookmarkButton
              contentType="algorithm"
              contentId={algorithm._id}
            />
            <button
              onClick={handleContribute}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 dark:bg-blue-800 dark:hover:bg-blue-700 text-white font-medium shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              <Sparkles size={20} />
              <span>Contribute</span>
            </button>
          </div>
        </section>

        {/* Comment Section */}
        <section>
          <CommentSection
            parentType="Algorithm"
            parentId={algorithm._id}
            parentSlug={algorithm.slug}
          />
        </section>
      </div>
    </motion.div>
  );
};

export default AlgorithmDetail;