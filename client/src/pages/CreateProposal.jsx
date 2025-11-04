import { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { DotLoader } from "react-spinners";
import ProposalForm from "../components/forms/ProposalForm";
import { submitNewProposal } from "../features/proposal/proposalSlice";
import {
  fetchCategories,
  fetchAlgorithmBySlug,
} from "../features/algorithm/algorithmSlice";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { ChevronLeft, Send, XCircle } from "lucide-react";
import clsx from "clsx";

const CreateProposal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { slug } = useParams();

  const themeMode = useSelector((state) => state.theme.mode);

  const {
    categories,
    algorithm,
    loading: algorithmLoading,
    error: algorithmError,
  } = useSelector((state) => state.algorithm);

  const [formData, setFormData] = useState({
    title: "",
    problemStatement: "",
    intuition: "",
    explanation: "",
    complexity: { time: "", space: "" },
    difficulty: "Easy",
    category: [],
    tags: [],
    links: [],
    codes: [{ language: "", code: "" }],
  });
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState("edit");

  const isContribution = useMemo(() => !!slug, [slug]);

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
    if (slug) {
      dispatch(fetchAlgorithmBySlug(slug));
    }
  }, [dispatch, slug, categories]);

  useEffect(() => {
    if (slug && algorithm) {
      setFormData({
        title: algorithm.title || "",
        problemStatement: algorithm.problemStatement || "",
        intuition: algorithm.intuition || "",
        explanation: algorithm.explanation || "",
        complexity: {
          time: algorithm.complexity?.time || "",
          space: algorithm.complexity?.space || "",
        },
        difficulty: algorithm.difficulty || "Easy",
        category: algorithm.category || [],
        tags: algorithm.tags || [],
        links: algorithm.links || [],
        codes: algorithm.codes || [{ language: "", code: "" }],
      });
    } else if (!slug) {
      setFormData({
        title: "",
        problemStatement: "",
        intuition: "",
        explanation: "",
        complexity: { time: "", space: "" },
        difficulty: "Easy",
        category: [],
        tags: [],
        links: [],
        codes: [{ language: "", code: "" }],
      });
    }
  }, [algorithm, slug]);

  const handleFormChange = useCallback((data) => {
    setFormData(data);
  }, []);

  const handleSubmit = async () => {
    if (!formData.title.trim() || !formData.problemStatement.trim()) {
      toast.error("Title and Problem Statement are required.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(
        submitNewProposal({ ...formData, algorithmSlug: slug || null })
      ).unwrap();
      toast.success(
        isContribution
          ? "Changes proposed successfully!"
          : "New proposal submitted successfully!",
        {
          position: "top-right",
          autoClose: 3000,
          theme: "colored",
        }
      );
      navigate("/proposals");
    } catch (err) {
      toast.error("Failed to submit proposal. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  if (algorithmLoading || (slug && !algorithm && !algorithmError)) {
    return (
      <div className={`flex justify-center items-center min-h-screen ${themeMode === 'dark' ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <DotLoader color="#A855F7" size={60} />
      </div>
    );
  }

  if (slug && algorithmError) {
    return (
      <div className={`flex flex-col justify-center items-center min-h-screen ${themeMode === 'dark' ? 'bg-gray-950 text-red-400' : 'bg-gray-50 text-red-600'} p-4 text-center`}>
        <XCircle size={48} className="mb-4" />
        <h2 className="text-3xl font-extrabold mb-3">
          Failed to Load Algorithm
        </h2>
        <p className={`text-xl max-w-lg mx-auto ${themeMode === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
          We couldn't fetch the algorithm data. Please check your connection or
          try again later.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-8 px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-indigo-700 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 transform hover:-translate-y-1"
        >
          Go to Home
        </button>
      </div>
    );
  }

  const isSubmitDisabled = !formData.title.trim() || submitting;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      // Adjusted top/bottom padding for the entire page container
      className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans" // py-8 instead of py-12
    >
      <div className={`bg-gradient-to-br ${themeMode === 'dark' ? 'from-gray-900 to-black' : 'from-gray-100 to-white'} rounded-3xl shadow-3xl overflow-hidden border ${themeMode === 'dark' ? 'border-gray-700' : 'border-gray-300'} backdrop-blur-sm relative`}>
        {/* Subtle background pattern/gradient for visual interest */}
        <div className="absolute inset-0 z-0 opacity-10" style={{
            backgroundImage: "radial-gradient(ellipse at top left, var(--tw-gradient-stops))",
            '--tw-gradient-from': 'rgba(100, 100, 200, 0.1)',
            '--tw-gradient-to': 'transparent',
            backgroundSize: '800px 800px',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'top left'
        }}></div>
        <div className="absolute inset-0 z-0 opacity-10" style={{
            backgroundImage: "radial-gradient(ellipse at bottom right, var(--tw-gradient-stops))",
            '--tw-gradient-from': 'rgba(200, 100, 100, 0.1)',
            '--tw-gradient-to': 'transparent',
            backgroundSize: '800px 800px',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'bottom right'
        }}></div>

        {/* Header Section */}
        <div className={`relative z-10 p-6 md:p-8 lg:p-8 border-b ${themeMode === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}> {/* Reduced padding here */}
          <motion.button
            onClick={handleCancel}
            className={`flex items-center text-base font-medium ${themeMode === 'dark' ? 'text-gray-400 hover:text-purple-400' : 'text-gray-600 hover:text-purple-600'} transition-colors duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${themeMode === 'dark' ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'} rounded-lg p-2 mb-3`} // Reduced mb-4 to mb-3
            whileHover={{ x: -5 }}
            aria-label="Go back"
          >
            <ChevronLeft className="w-6 h-6 mr-2" />
            <span className="hidden sm:inline">Back to Proposals</span>
            <span className="sm:hidden">Back</span>
          </motion.button>
          
          <div className="text-left">
            <h1 className={`text-4xl md:text-5xl font-extrabold mb-2 leading-tight tracking-tight ${themeMode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
              {isContribution ? "Propose Algorithm Enhancements" : "Submit a New Algorithm Idea"}
            </h1>
            <p className={`text-xl mt-2 ${themeMode === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              {isContribution
                ? `Refine "${algorithm?.title || "an existing algorithm"}"`
                : "Share your innovative solution with the community"}
            </p>
          </div>
        </div>

        {/* Mode Toggle Tabs */}
        <div className={`relative z-10 flex border-b ${themeMode === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-300 bg-gray-100'}`}>
          {["edit", "preview"].map((tab) => (
            <button
              key={tab}
              onClick={() => setMode(tab)}
              className={clsx(
                "flex-1 py-4 px-6 text-center text-xl font-bold transition-all duration-200 relative group", // Reduced py-5 to py-4
                mode === tab
                  ? `text-purple-400 ${themeMode === 'dark' ? 'bg-gray-850' : 'bg-white'}`
                  : `${themeMode === 'dark' ? 'text-gray-500 hover:text-purple-300 bg-gray-800' : 'text-gray-600 hover:text-purple-500 bg-gray-100'}`
              )}
              aria-selected={mode === tab}
              role="tab"
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {mode === tab && (
                <motion.span
                  layoutId="underline-create"
                  className="absolute bottom-0 left-0 w-full h-1 bg-purple-500 rounded-t-lg shadow-lg"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Proposal Form Section */}
        <div className={`relative z-10 p-6 md:p-8 lg:p-8 ${themeMode === 'dark' ? 'bg-gray-850' : 'bg-white'} border-t ${themeMode === 'dark' ? 'border-gray-700' : 'border-gray-300'} rounded-b-3xl`}> {/* Reduced padding here */}
          <ProposalForm
            categories={categories}
            proposal={formData}
            onSave={handleFormChange}
            mode={mode}
          />
        </div>

        {/* Action Buttons Section */}
        <div className={`relative z-10 p-6 md:p-8 lg:p-8 ${themeMode === 'dark' ? 'bg-gray-900' : 'bg-gray-50'} border-t ${themeMode === 'dark' ? 'border-gray-700' : 'border-gray-300'}`}> {/* Reduced padding here */}
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-5">
            <motion.button
              onClick={handleCancel}
              className={`px-8 py-4 rounded-full ${themeMode === 'dark' ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'} font-semibold text-lg hover:shadow-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${themeMode === 'dark' ? 'focus:ring-offset-gray-900' : 'focus:ring-offset-white'} flex items-center justify-center gap-2`}
              type="button"
              aria-label="Cancel proposal submission"
              whileHover={{ scale: 1.02, backgroundColor: themeMode === 'dark' ? "#4b5563" : "#9ca3af" }}
              whileTap={{ scale: 0.98 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={handleSubmit}
              disabled={isSubmitDisabled}
              className="px-10 py-4 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white font-bold text-lg shadow-lg hover:shadow-xl hover:from-purple-700 hover:to-indigo-800 transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 flex items-center justify-center gap-2 transform hover:-translate-y-1"
              type="button"
              aria-label={
                isContribution ? "Submit proposed changes" : "Submit new proposal"
              }
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {submitting ? (
                <DotLoader color="#fff" size={20} className="mr-2" />
              ) : (
                <Send size={20} className="mr-2" />
              )}
              {isContribution ? "Submit Changes" : "Submit Proposal"}
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CreateProposal;