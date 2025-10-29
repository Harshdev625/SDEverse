import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchSuiteProblems,
  fetchSuiteMetrics,
  toggleProblemComplete,
} from "../features/problemSheet/problemSheetSlice";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  StickyNote,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Loader from "../components/Loader";
import NotesModal from "../components/problemSheets/NotesModal";
import SolutionsModal from "../components/problemSheets/SolutionsModal";
import { toast } from "react-toastify";

const SuiteProblems = () => {
  const { sheetId, suiteId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  const {
    problems,
    metrics,
    pagination,
    currentSuite,
    problemsLoading,
    metricsLoading,
    error,
  } = useSelector((state) => state.problemSheet);

  const [currentPage, setCurrentPage] = useState(1);
  const [difficulty, setDifficulty] = useState("all");
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [showSolutionsModal, setShowSolutionsModal] = useState(false);

  // Fetch problems and metrics
  useEffect(() => {
    const params = {
      page: currentPage,
      limit: 15,
      difficulty: difficulty !== "all" ? difficulty : undefined,
    };
    
    dispatch(fetchSuiteProblems({ sheetId, suiteId, params }));
    dispatch(fetchSuiteMetrics({ 
      sheetId, 
      suiteId, 
      params: { difficulty: difficulty !== "all" ? difficulty : undefined }
    }));
  }, [sheetId, suiteId, currentPage, difficulty, dispatch]);

  // Handle filter change
  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
    setCurrentPage(1); // Reset to page 1 when filter changes
  };

  // Handle checkbox toggle
  const handleToggleComplete = async (problemId, currentStatus) => {
    if (!user) {
      toast.info("Please log in to track your progress");
      return;
    }
    
    try {
      await dispatch(toggleProblemComplete({
        problemId,
        completed: !currentStatus,
      })).unwrap();
      
      // Refresh metrics
      const params = {
        difficulty: difficulty !== "all" ? difficulty : undefined,
      };
      dispatch(fetchSuiteMetrics({ sheetId, suiteId, params }));
      
      toast.success(currentStatus ? "Unmarked as complete" : "Marked as complete!");
    } catch (error) {
      toast.error("Failed to update progress");
    }
  };

  // Handle notes modal
  const handleOpenNotes = (problem) => {
    if (!user) {
      toast.info("Please log in to add notes");
      return;
    }
    setSelectedProblem(problem);
    setShowNotesModal(true);
  };

  // Handle solutions modal
  const handleOpenSolutions = (problem) => {
    if (!user) {
      toast.info("Please log in to view solutions");
      return;
    }
    setSelectedProblem(problem);
    setShowSolutionsModal(true);
  };

  // Pagination handlers
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination?.totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (problemsLoading && !problems.length) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl"
    >
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate(`/problem-sheets/${sheetId}`)}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4"
        >
          <ArrowLeft size={20} />
          Back to Suites
        </button>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {currentSuite?.name || "Problems"}
        </h1>
      </div>

      {/* Metrics Bar */}
      {metrics && !metricsLoading && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 mb-6 border border-blue-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Total Progress */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Total Progress</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {metrics.overall?.completedProblems ?? 0} / {metrics.overall?.totalProblems ?? 0}
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-3">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                  style={{ width: `${metrics.overall?.progressPercentage ?? 0}%` }}
                />
              </div>
            </div>

            {/* Easy */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Easy</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {metrics.byDifficulty?.easy?.completed ?? 0} / {metrics.byDifficulty?.easy?.total ?? 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {(metrics.byDifficulty?.easy?.percentage ?? 0).toFixed(1)}% completed
              </p>
            </div>

            {/* Medium */}
            <div className="text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Medium</p>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">
                {metrics.byDifficulty?.medium?.completed ?? 0} / {metrics.byDifficulty?.medium?.total ?? 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {(metrics.byDifficulty?.medium?.percentage ?? 0).toFixed(1)}% completed
              </p>
            </div>

            {/* Hard */}
            <div className="text-center md:col-start-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Hard</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {metrics.byDifficulty?.hard?.completed ?? 0} / {metrics.byDifficulty?.hard?.total ?? 0}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                {(metrics.byDifficulty?.hard?.percentage ?? 0).toFixed(1)}% completed
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {["all", "easy", "medium", "hard"].map((level) => (
          <button
            key={level}
            onClick={() => handleDifficultyChange(level)}
            className={`px-6 py-2 rounded-lg font-medium transition-all ${
              difficulty === level
                ? "bg-blue-600 text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {level === "all" ? "All" : level.charAt(0).toUpperCase() + level.slice(1)}
          </button>
        ))}
      </div>

      {/* Problems Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        {problemsLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader />
          </div>
        ) : problems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No problems found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Problem
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {problems.map((problem) => (
                  <tr
                    key={problem.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    {/* Checkbox */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleComplete(problem.id, problem.completed)}
                        className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all ${
                          problem.completed
                            ? "bg-green-500 border-green-500"
                            : "border-gray-300 dark:border-gray-600 hover:border-green-500"
                        }`}
                      >
                        {problem.completed && <Check size={16} className="text-white" />}
                      </button>
                    </td>

                    {/* Problem Title */}
                    <td className="px-6 py-4">
                      <div>
                        <a
                          href={problem.leetcodeLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          {problem.title}
                        </a>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          #{problem.order}
                        </p>
                      </div>
                    </td>

                    {/* Difficulty */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          problem.difficulty === "easy"
                            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                            : problem.difficulty === "medium"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        }`}
                      >
                        {problem.difficulty.charAt(0).toUpperCase() + problem.difficulty.slice(1)}
                      </span>
                    </td>

                    {/* Tags */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {problem.tags?.slice(0, 2).map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {problem.tags?.length > 2 && (
                          <span className="px-2 py-1 text-gray-500 dark:text-gray-400 text-xs">
                            +{problem.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleOpenNotes(problem)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          title="Notes"
                        >
                          <StickyNote
                            size={18}
                            className={
                              problem.hasNotes
                                ? "text-yellow-500"
                                : "text-gray-400 dark:text-gray-500"
                            }
                          />
                        </button>
                        <button
                          onClick={() => handleOpenSolutions(problem)}
                          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                          title="Hints & Solution"
                        >
                          <Lightbulb size={18} className="text-blue-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={!pagination.hasPreviousPage}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ChevronLeft size={20} />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {[...Array(pagination.totalPages)].map((_, idx) => {
              const pageNum = idx + 1;
              // Show first, last, current, and adjacent pages
              if (
                pageNum === 1 ||
                pageNum === pagination.totalPages ||
                (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
              ) {
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              } else if (
                pageNum === currentPage - 2 ||
                pageNum === currentPage + 2
              ) {
                return (
                  <span key={pageNum} className="text-gray-500">
                    ...
                  </span>
                );
              }
              return null;
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={!pagination.hasNextPage}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            Next
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Modals */}
      {showNotesModal && selectedProblem && (
        <NotesModal
          problem={selectedProblem}
          onClose={() => {
            setShowNotesModal(false);
            setSelectedProblem(null);
          }}
        />
      )}

      {showSolutionsModal && selectedProblem && (
        <SolutionsModal
          problem={selectedProblem}
          onClose={() => {
            setShowSolutionsModal(false);
            setSelectedProblem(null);
          }}
        />
      )}
    </motion.div>
  );
};

export default SuiteProblems;