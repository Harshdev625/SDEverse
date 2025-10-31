import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import * as api from "../../features/problemSheet/problemSheetAPI";
import Loader from "../Loader";
import CodeDisplay from "../code/CodeDisplay";
import { Lightbulb, Lock, Unlock } from "lucide-react";

const ProblemSolutionDropdown = ({ problemId }) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  
  // State to track viewed hints
  const [viewedHints, setViewedHints] = useState(new Set());

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const res = await api.getHintsSolution(problemId);
        setData(res.data);
      } catch (err) {
        setError("Failed to load hints and solution.");
        toast.error("Failed to load hints and solution.");
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [problemId]);

  const handleViewHint = (hintNumber) => {
    setViewedHints((prev) => new Set(prev).add(hintNumber));
  };

  const allHintsViewed = () => {
    if (!data?.hints || data.hints.length === 0) return true; // No hints to view, so solution is unlocked
    return data.hints.every((hint) => viewedHints.has(hint.hintNumber));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-500">{error}</div>
    );
  }

  if (!data) return null;

  const isSolutionUnlocked = allHintsViewed();

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-800">
      {/* Hints Section */}
      {data.hints && data.hints.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Hints ({viewedHints.size}/{data.hints.length})
          </h3>
          <div className="space-y-4">
            {data.hints.map((hint) => (
              <div
                key={hint.hintNumber}
                className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <p className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <Lightbulb size={16} className="text-yellow-500" />
                  Hint {hint.hintNumber}
                </p>
                {!viewedHints.has(hint.hintNumber) ? (
                  <button
                    onClick={() => handleViewHint(hint.hintNumber)}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Lock size={14} />
                    Click to Reveal Hint
                  </button>
                ) : (
                  <p className="text-gray-700 dark:text-gray-300">
                    {hint.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Solution Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            {isSolutionUnlocked ? (
              <Unlock size={18} className="text-green-500" />
            ) : (
              <Lock size={18} className="text-gray-400" />
            )}
            Solution
          </h3>
          {!isSolutionUnlocked && (
             <span className="text-xs text-gray-500 dark:text-gray-400">
              View all {data.hints.length} hints to unlock
            </span>
          )}
        </div>

        {isSolutionUnlocked ? (
          data.solution?.content ? (
            <CodeDisplay implementation={{ codes: data.solution.content }} />
          ) : (
            <p className="text-gray-500 dark:text-gray-400">
              No solution code available for this problem.
            </p>
          )
        ) : (
          <div className="flex items-center justify-center h-32 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
            <p className="text-gray-500 dark:text-gray-400">
              Solution is locked
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemSolutionDropdown;