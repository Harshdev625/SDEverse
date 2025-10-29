import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchSheetById, clearCurrentSheet } from "../features/problemSheet/problemSheetSlice";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowLeft, BookOpen, Target } from "lucide-react";
import Loader from "../components/Loader";

const SheetDetail = () => {
  const { sheetId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { currentSheet, sheetLoading, error } = useSelector((state) => state.problemSheet);
  const [expandedSuite, setExpandedSuite] = useState(null);

  useEffect(() => {
    dispatch(fetchSheetById(sheetId));
    return () => dispatch(clearCurrentSheet());
  }, [sheetId, dispatch]);

  const toggleSuite = (suiteId) => {
    setExpandedSuite(expandedSuite === suiteId ? null : suiteId);
  };

  if (sheetLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  if (!currentSheet) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-400 dark:border-yellow-700 text-yellow-700 dark:text-yellow-300 px-4 py-3 rounded-lg">
          Sheet not found
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
      <div className="mb-8">
        <button
          onClick={() => navigate("/problem-sheets")}
          className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline mb-4"
        >
          <ArrowLeft size={20} />
          Back to Problem Sheets
        </button>
        
        <div className="flex items-center gap-4 mb-4">
          <span className="text-5xl">{currentSheet.icon}</span>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {currentSheet.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {currentSheet.description}
            </p>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-semibold text-gray-900 dark:text-white">
              Total Progress
            </span>
            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
              {currentSheet.completedProblems ?? 0} / {currentSheet.totalProblems ?? 0}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4">
            <div
              className="bg-gradient-to-r from-blue-500 to-blue-600 h-4 rounded-full transition-all"
              style={{ width: `${currentSheet.progressPercentage ?? 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Suites List */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Problem Suites
        </h2>

        {currentSheet.suites?.map((suite) => (
          <div
            key={suite.id}
            className="border rounded-xl overflow-hidden shadow-sm transition-all border-gray-200 dark:border-gray-700"
          >
            {/* Suite Header */}
            <button
              onClick={() => toggleSuite(suite.id)}
              className="w-full flex justify-between items-center p-5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex-1 text-left">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {suite.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {suite.description}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm">
                  <span className="text-gray-600 dark:text-gray-400">
                    {suite.totalProblems} problems
                  </span>
                  <span className="text-blue-600 dark:text-blue-400 font-medium">
                    {(suite.progressPercentage ?? 0).toFixed(0)}% completed
                  </span>
                </div>
              </div>
              <ChevronDown
                size={20}
                className={`transition-transform ${
                  expandedSuite === suite.id ? "rotate-180" : ""
                } text-gray-500 dark:text-gray-400`}
              />
            </button>

            {/* Suite Details */}
            <AnimatePresence>
              {expandedSuite === suite.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden bg-gray-50 dark:bg-gray-900"
                >
                  <div className="p-5 space-y-4">
                    {/* Problem Types */}
                    {suite.problemTypes && suite.problemTypes.length > 0 && (
                      <div>
                        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                          Topics Covered:
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {suite.problemTypes.map((type, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                            >
                              {type}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>Progress</span>
                        <span>{suite.completedProblems ?? 0} / {suite.totalProblems ?? 0}</span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all"
                          style={{ width: `${suite.progressPercentage ?? 0}%` }}
                        />
                      </div>
                    </div>

                    {/* Start Button */}
                    <button
                      onClick={() => navigate(`/problem-sheets/${sheetId}/suites/${suite.id}`)}
                      className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md flex items-center justify-center gap-2"
                    >
                      <Target size={20} />
                      Start Solving
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default SheetDetail;