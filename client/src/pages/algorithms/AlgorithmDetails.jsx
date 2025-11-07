import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAlgorithmBySlug,
  voteOnAlgorithm,
} from "../../features/algorithm/algorithmSlice";
import Loader from "../../components/Loader";
import AlgorithmPreview from "../../components/preview/AlgorithmPreview";
import CommentSection from "../shared/CommentSection";
import {
  ArrowLeft,
  ArrowRight,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
} from "lucide-react";
import { motion as Motion } from "framer-motion";
import { toast } from "react-toastify";

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

  if (loading) {
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
          <p className="mb-6 text-sm">{error || "Unable to load algorithm."}</p>
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

  if (!algorithm) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900 p-4">
        <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-800 text-blue-800 dark:text-blue-200 p-6 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h2 className="text-2xl font-bold mb-4">Algorithm Not Found</h2>
          <p className="mb-6 text-sm">
            The requested algorithm could not be found.
          </p>
          <button
            onClick={() => navigate("/algorithms")}
            className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-md"
          >
            Browse Algorithms
          </button>
        </div>
      </div>
    );
  }

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
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
            {algorithm.title}
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
          <AlgorithmPreview algorithm={algorithm} />
        </section>

        <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleVote("upvote")}
                className={`flex items-center gap-2 px-5 py-2 rounded-full shadow-md transition-all ${
                  currentUserVoteType === "upvote"
                    ? "bg-green-600 text-white"
                    : "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-900"
                }`}
                aria-label="Upvote"
              >
                <ThumbsUp
                  size={20}
                  className={
                    currentUserVoteType === "upvote" ? "fill-current" : ""
                  }
                />
                <span className="font-semibold">{algorithm.upvotes || 0}</span>
              </Motion.button>
              <Motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleVote("downvote")}
                className={`flex items-center gap-2 px-5 py-2 rounded-full shadow-md transition-all ${
                  currentUserVoteType === "downvote"
                    ? "bg-red-600 text-white"
                    : "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-900"
                }`}
                aria-label="Downvote"
              >
                <ThumbsDown
                  size={20}
                  className={
                    currentUserVoteType === "downvote" ? "fill-current" : ""
                  }
                />
                <span className="font-semibold">
                  {algorithm.downvotes || 0}
                </span>
              </Motion.button>
            </div>

            <Motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleContribute}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 text-white font-medium shadow-lg hover:from-blue-700 hover:to-blue-800 transition-all"
              aria-label="Contribute to algorithm"
            >
              <Sparkles size={20} />
              <span>Contribute</span>
            </Motion.button>
          </div>
        </section>

        <section className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50">
          <CommentSection
            parentType="Algorithm"
            parentId={algorithm._id}
            parentSlug={algorithm.slug}
          />
        </section>
      </main>
    </Motion.div>
  );
};

export default AlgorithmDetail;
