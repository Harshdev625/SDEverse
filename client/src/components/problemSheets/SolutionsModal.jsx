import { useState, useEffect, useRef } from "react";
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
  const [viewedHints, setViewedHints] = useState(new Set());
  const [expandedHints, setExpandedHints] = useState({});
  const [expandedSolution, setExpandedSolution] = useState(false);
  const [selectedLang, setSelectedLang] = useState("python");
  const hintRefs = useRef({});

  useEffect(() => {
    loadHintsSolution();
  }, [problem.id]);

  // Intersection Observer to detect when hints come into view
  useEffect(() => {
    if (!data?.hints || data.hints.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const hintNumber = parseInt(entry.target.dataset.hintNumber);
            setViewedHints((prev) => new Set([...prev, hintNumber]));
          }
        });
      },
      { threshold: 0.5 }
    );

    data.hints.forEach((hint) => {
      if (hintRefs.current[hint.hintNumber]) {
        observer.observe(hintRefs.current[hint.hintNumber]);
      }
    });

    return () => observer.disconnect();
  }, [data?.hints]);

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

  const toggleHint = (hintNumber) => {
    setExpandedHints((prev) => ({
      ...prev,
      [hintNumber]: !prev[hintNumber],
    }));
  };

  const allHintsViewed = () => {
    if (!data?.hints || data.hints.length === 0) return false;
    return data.hints.every((hint) => viewedHints.has(hint.hintNumber));
  };

  const renderHint = (hint) => {
    const isExpanded = expandedHints[hint.hintNumber];
    const isViewed = viewedHints.has(hint.hintNumber);

    return (
      <div
        key={hint.hintNumber}
        ref={(el) => (hintRefs.current[hint.hintNumber] = el)}
        data-hint-number={hint.hintNumber}
        className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
      >
        <button
          onClick={() => toggleHint(hint.hintNumber)}
          aria-expanded={isViewed && isExpanded}
          aria-label={`Hint ${hint.hintNumber}${isViewed ? '' : ' - scroll to view'}`}
          className={`w-full flex items-center justify-between p-4 transition-colors ${
            isViewed
              ? "bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50"
              : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <div className="flex items-center gap-3">
            {isViewed ? (
              <Unlock size={18} className="text-green-500" />
            ) : (
              <Lock size={18} className="text-gray-400" />
            )}
            <span className="font-medium text-gray-900 dark:text-white">
              Hint {hint.hintNumber}
            </span>
            {!isViewed && (
              <span className="text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded text-gray-700 dark:text-gray-300">
                Scroll to view
              </span>
            )}
          </div>
          {isViewed && (
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={20} className="text-gray-500" />
            </motion.div>
          )}
        </button>

        <AnimatePresence>
          {isViewed && isExpanded && (
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
    if (!data?.solution) return null;

    const availableLangs = Object.keys(data.solution?.content || {}).filter(
      (lang) => data.solution.content[lang]
    );
    const isUnlocked = allHintsViewed();

    return (
      <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
        <button
          onClick={() => {
            if (isUnlocked) {
              setExpandedSolution(!expandedSolution);
            } else {
              toast.info(`View all ${data.hints?.length || 0} hints to unlock the solution`);
            }
          }}
          aria-expanded={isUnlocked && expandedSolution}
          aria-label={`Complete solution${!isUnlocked ? ' - locked' : ''}`}
          disabled={!isUnlocked}
          className={`w-full flex items-center justify-between p-4 transition-colors ${
            isUnlocked
              ? "bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50"
              : "bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700"
          }`}
        >
          <div className="flex items-center gap-3">
            {isUnlocked ? (
              <Unlock size={18} className="text-green-500" />
            ) : (
              <Lock size={18} className="text-gray-400" />
            )}
            <div className="text-left">
              <span className="font-bold text-lg text-gray-900 dark:text-white">
                Complete Solution
              </span>
              {!isUnlocked && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  View all hints to unlock ({viewedHints.size}/{data.hints?.length || 0})
                </p>
              )}
            </div>
          </div>
          {isUnlocked && (
            <motion.div
              animate={{ rotate: expandedSolution ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown size={20} className="text-gray-500" />
            </motion.div>
          )}
        </button>

        <AnimatePresence>
          {isUnlocked && expandedSolution && data.solution.content && (
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
                        Solution
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
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl p-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-center text-gray-600 dark:text-gray-400 mt-4">
            Loading hints and solutions...
          </p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b dark:border-gray-700 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {problem.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {viewedHints.size} of {data.hints?.length || 0} hints viewed
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[70vh]">
          {/* Hints Section */}
          {data.hints && data.hints.length > 0 && (
            <div>
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-4">
                Hints ({viewedHints.size}/{data.hints.length})
              </h4>
              <div className="space-y-3">
                {data.hints.map((hint) => renderHint(hint))}
              </div>
            </div>
          )}

          {/* Solution Section */}
          <div>
            {renderSolution()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SolutionsModal;