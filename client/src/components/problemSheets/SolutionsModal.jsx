import { useState, useEffect } from "react";
import { X, ChevronDown, Lock, Unlock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark, materialLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useSelector } from "react-redux";
import * as api from "../../features/problemSheet/problemSheetAPI";

const SolutionsModal = ({ problem, onClose }) => {
  const themeMode = useSelector((state) => state.theme.mode);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedHints, setExpandedHints] = useState({});
  const [expandedSolution, setExpandedSolution] = useState(false);

  useEffect(() => {
    loadHintsSolution();
  }, [problem.id]);

  const loadHintsSolution = async () => {
    try {
      setLoading(true);
      const response = await api.getHintsSolution(problem.id);
      setData(response.data);
    } catch (error) {
      console.error("Error loading hints/solution:", error);
      toast.error("Failed to load hints and solution");
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockHint = async (hintNumber) => {
    try {
      const response = await api.unlockHint(problem.id, hintNumber);
      setData((prev) => ({
        ...prev,
        hints: prev?.hints?.map((hint) =>
          hint.hintNumber === hintNumber
            ? { ...hint, isUnlocked: true, content: response.data.content }
            : hint
        ),
      }));
      setExpandedHints((prev) => ({ ...prev, [hintNumber]: true }));
      toast.success(`Hint ${hintNumber} unlocked!`);
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Failed to unlock hint");
    }
  };

  const handleUnlockSolution = async () => {
    try {
      const response = await api.unlockSolution(problem.id);
      setData((prev) => ({
        ...prev,
        solution: {
          ...prev.solution,
          isUnlocked: true,
          content: response.data.solution,
        },
      }));
      setExpandedSolution(true);
      toast.success("Solution unlocked!");
    } catch (error) {
      toast.error(error.response?.data?.error?.message || "Failed to unlock solution");
    }
  };

  const toggleHint = (hintNumber) => {
    setExpandedHints((prev) => ({
      ...prev,
      [hintNumber]: !prev[hintNumber],
    }));
  };

  const renderHint = (hint) => {
    const isExpanded = expandedHints[hint.hintNumber];
    return (
      <div
        key={hint.hintNumber}
        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
      >
        <button
          onClick={() => {
            if (hint.isUnlocked) {
              toggleHint(hint.hintNumber);
            } else {
              handleUnlockHint(hint.hintNumber);
            }
          }}
          className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <div className="flex items-center gap-3">
            {hint.isUnlocked ? (
              <Unlock size={18} className="text-green-500" />
            ) : (
              <Lock size={18} className="text-gray-400" />
            )}
            <span className="font-medium text-gray-900 dark:text-white">
              Hint {hint.hintNumber}
            </span>
          </div>
          {hint.isUnlocked && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={20} className="text-gray-500" />
            </motion.div>
          )}
        </button>

        <AnimatePresence>
          {hint.isUnlocked && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {hint.content}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  const renderSolution = () => {
  if (!data.solution) return null;

  const [selectedLang, setSelectedLang] = useState("python");

  const availableLangs = Object.keys(data.solution?.content || {});

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <button
        onClick={() => {
          if (data.solution.isUnlocked) {
            setExpandedSolution(!expandedSolution);
          } else if (data.solution.canUnlock) {
            handleUnlockSolution();
          } else {
            toast.info("Unlock all 6 hints first to view the solution");
          }
        }}
        className={`w-full flex items-center justify-between p-4 transition-colors ${
          data.solution.canUnlock
            ? "bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50"
            : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
        }`}
      >
        <div className="flex items-center gap-3">
          {data.solution.isUnlocked ? (
            <Unlock size={18} className="text-green-500" />
          ) : data.solution.canUnlock ? (
            <Lock size={18} className="text-blue-500" />
          ) : (
            <Lock size={18} className="text-gray-400" />
          )}
          <span className="font-bold text-lg text-gray-900 dark:text-white">
            Complete Solution
          </span>
        </div>
        {data.solution.isUnlocked && (
          <motion.div
            animate={{ rotate: expandedSolution ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown size={20} className="text-gray-500" />
          </motion.div>
        )}
      </button>

      <AnimatePresence>
        {data.solution.isUnlocked && expandedSolution && data.solution.content && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 space-y-6">
              {availableLangs.length > 0 && (
                <>
                  {/* Language Selector */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">
                      Algorithm
                    </h4>
                    <select
                      value={selectedLang}
                      onChange={(e) => setSelectedLang(e.target.value)}
                      className="border border-gray-300 dark:border-gray-700 rounded-md px-2 py-1 text-sm bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200"
                    >
                      {availableLangs.map((lang) => (
                        <option key={lang} value={lang}>
                          {lang.charAt(0).toUpperCase() + lang.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Code Display */}
                  {data.solution.content[selectedLang] ? (
                    <SyntaxHighlighter
                      language={selectedLang}
                      style={themeMode === "dark" ? materialDark : materialLight}
                      className="rounded-lg"
                    >
                      {data.solution.content[selectedLang]}
                    </SyntaxHighlighter>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      No {selectedLang} implementation available.
                    </p>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {problem.title}
          </h3>
          <button onClick={onClose}>
            <X className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300" />
          </button>
        </div>
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {data.hints?.map((hint) => renderHint(hint))}
          {renderSolution()}
        </div>
      </div>
    </div>
  );
};

export default SolutionsModal;
