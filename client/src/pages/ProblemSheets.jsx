import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchAllSheets } from "../features/problemSheet/ProblemSheetSlice";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
import Loader from "../components/Loader";

const ProblemSheets = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sheets, sheetsLoading, error } = useSelector((state) => state.problemSheet);
  const [expandedSheet, setExpandedSheet] = useState(null);

  useEffect(() => {
    dispatch(fetchAllSheets());
  }, [dispatch]);

  const toggleSheet = (sheetId) => {
    setExpandedSheet(expandedSheet === sheetId ? null : sheetId);
  };

  if (sheetsLoading) {
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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl"
    >
      {/* Navigation */}
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate(-1)}
          aria-label="Go back"
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shadow-sm"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          onClick={() => navigate(1)}
          aria-label="Go forward"
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all shadow-sm"
        >
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Hero Section */}
      <div className="mb-10">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
          Problem Sheets
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
          Choose from curated problem sheets to practice and master data structures and algorithms.
          Each sheet contains carefully selected problems organized by topics.
        </p>
      </div>

      {/* Sheets List */}
      <div className="space-y-6">
        {sheets.length === 0 ? (
          <div className="text-center py-10">
            <BookOpen size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No problem sheets available yet.
            </p>
          </div>
        ) : (
          sheets.map((sheet) => (
            <div
              key={sheet._id} // <-- FIX #1: Use sheet._id for the key prop
              className="border rounded-xl overflow-hidden shadow-sm transition-all border-gray-200 dark:border-gray-700"
            >
              {/* Sheet Header */}
              <button
                onClick={() => toggleSheet(sheet._id)} // <-- FIX #2: Use sheet._id
                aria-expanded={expandedSheet === sheet._id} // <-- FIX #3: Use sheet._id
                aria-label={`${expandedSheet === sheet._id ? 'Collapse' : 'Expand'} ${sheet.name} details`} // <-- FIX #4: Use sheet._id
                className="w-full flex justify-between items-center p-6 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <span className="text-3xl">{sheet.icon}</span>
                  <div className="text-left">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {sheet.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {sheet.totalProblems} problems · {(sheet.progressPercentage ?? 0).toFixed(1)}% completed
                    </p>
                  </div>
                </div>
                <ChevronDown
                  size={24}
                  className={`transition-transform ${
                    expandedSheet === sheet._id ? "rotate-180" : "" // <-- FIX #5: Use sheet._id
                  } text-gray-500 dark:text-gray-400`}
                />
              </button>

              {/* Sheet Description & Suites */}
              <AnimatePresence>
                {expandedSheet === sheet._id && ( // <-- FIX #6: Use sheet._id
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden bg-gray-50 dark:bg-gray-900"
                  >
                    <div className="p-6 space-y-6">
                      {/* Description */}
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {sheet.description}
                      </p>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <span>Overall Progress</span>
                          <span>{sheet.completedProblems ?? 0} / {sheet.totalProblems ?? 0}</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                            style={{ width: `${sheet.progressPercentage ?? 0}%` }}
                          />
                        </div>
                      </div>

                      {/* View Sheet Button */}
                      <button
                        onClick={() => navigate(`/problem-sheets/${sheet._id}`)} // <-- FIX #7: Use sheet._id for navigation
                        className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all shadow-md"
                      >
                        View Problem Suites
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default ProblemSheets;