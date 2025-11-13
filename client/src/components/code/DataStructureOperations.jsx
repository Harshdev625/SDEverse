import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { ChevronDown, ChevronUp, Code2, Copy } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark, materialLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "react-toastify";
import { Tooltip } from "react-tooltip";
import { MarkdownRenderer } from "../../pages/shared/CommentSection";
import clsx from "clsx";

const OperationItem = ({ operation, index, isOpen, onToggle, isAdmin, themeMode, copyCode }) => {
  const [selectedLangIndex, setSelectedLangIndex] = useState(0);
  const operationId = `operation-${index}`;

  return (
    <Motion.div
      key={operationId}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }}
      className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden"
    >
      <button
        onClick={() => onToggle(index)}
        className="w-full flex justify-between items-center px-4 py-3 sm:px-5 sm:py-4 text-left text-base sm:text-lg font-semibold text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        data-tooltip-id={operationId}
        data-tooltip-content={`Toggle ${operation.name?.trim() || "operation"} details`}
        aria-expanded={isOpen}
        aria-controls={`operation-content-${index}`}
      >
        <span>{operation.name?.trim() || `Operation ${index + 1}`}</span>
        <Motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </Motion.div>
      </button>
      <Tooltip
        id={operationId}
        place="top"
        className="z-50 bg-gray-800 text-white text-sm rounded-md px-3 py-1.5"
      />
      <AnimatePresence>
        {isOpen && (
          <Motion.div
            id={`operation-content-${index}`}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 py-4 sm:px-5 sm:py-5 space-y-4 overflow-hidden"
          >
            <div>
              <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-1">
                Description
              </h4>
              <div className="prose prose-base dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                <MarkdownRenderer>
                  {operation.description?.trim() || "No description provided."}
                </MarkdownRenderer>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 text-base text-gray-600 dark:text-gray-300">
              <p>
                <span className="font-medium">Time Complexity:</span>{" "}
                {operation.complexity?.time?.trim() || "N/A"}
              </p>
              <p>
                <span className="font-medium">Space Complexity:</span>{" "}
                {operation.complexity?.space?.trim() || "N/A"}
              </p>
            </div>

            {Array.isArray(operation.implementations) &&
              operation.implementations.length > 0 && (
                <div>
                  <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mb-2">
                    Implementations
                  </h4>
                  <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="flex flex-wrap gap-1 p-1 bg-gray-100 dark:bg-gray-900">
                      {operation.implementations.map((impl, implIndex) => (
                        <button
                          key={implIndex}
                          onClick={() => setSelectedLangIndex(implIndex)}
                          className={clsx(
                            "px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200",
                            selectedLangIndex === implIndex
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                          )}
                        >
                          {impl.codeDetails?.language?.trim() ||
                            `Code ${implIndex + 1}`}
                        </button>
                      ))}
                    </div>

                    <div className="p-4 sm:p-5 bg-white dark:bg-gray-800">
                      <div className="space-y-4">
                        <div className="relative rounded-md overflow-hidden">
                          {operation.implementations[selectedLangIndex]?.codeDetails?.code?.trim() ? (
                            <>
                              <SyntaxHighlighter
                                language={
                                  operation.implementations[
                                    selectedLangIndex
                                  ]?.codeDetails?.language
                                    ?.toLowerCase()
                                    .trim() || "javascript"
                                }
                                style={
                                  themeMode === "dark"
                                    ? materialDark
                                    : materialLight
                                }
                                showLineNumbers
                                wrapLongLines
                                customStyle={{
                                  padding: "1.25rem",
                                  borderRadius: "0.5rem",
                                  backgroundColor:
                                    themeMode === "dark"
                                      ? "#1a1a1a"
                                      : "#f8f9fa",
                                  fontSize: "0.875rem",
                                  lineHeight: "1.5",
                                }}
                                codeTagProps={{ className: "font-mono" }}
                              >
                                {
                                  operation.implementations[selectedLangIndex]
                                    ?.codeDetails?.code.trim()
                                }
                              </SyntaxHighlighter>

                              <Motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() =>
                                  copyCode(
                                    operation.implementations[selectedLangIndex]
                                      ?.codeDetails?.code
                                  )
                                }
                                className="absolute top-2 right-2 bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm flex items-center gap-1.5 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                aria-label="Copy code"
                                data-tooltip-id={`copy-code-${operationId}-${selectedLangIndex}`}
                                data-tooltip-content="Copy code to clipboard"
                              >
                                <Copy size={16} /> Copy
                              </Motion.button>
                              <Tooltip
                                id={`copy-code-${operationId}-${selectedLangIndex}`}
                                place="top"
                                className="z-50 bg-gray-800 text-white text-sm rounded-md px-3 py-1.5"
                              />
                            </>
                          ) : (
                            <pre className="p-4 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white text-sm rounded-md overflow-x-auto">
                              <code>No code available.</code>
                            </pre>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            {isAdmin && (
              <div className="mt-4">
                <button
                  className="text-base text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 flex items-center gap-1.5 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  onClick={() =>
                    toast.info("Edit operation functionality coming soon!")
                  }
                  aria-label={`Edit operation ${operation.name?.trim() || `Operation ${index + 1}`}`}
                >
                  Edit Operation
                </button>
              </div>
            )}
          </Motion.div>
        )}
      </AnimatePresence>
    </Motion.div>
  );
};

const DataStructureOperations = ({ dataStructure, isAdmin = false }) => {
  const [openOperationIndex, setOpenOperationIndex] = useState(null);
  const themeMode = useSelector((state) => state.theme.mode);

  const toggleOperation = useCallback((index) => {
    setOpenOperationIndex((prev) => (prev === index ? null : index));
  }, []);

  const copyCode = useCallback(async (code) => {
    if (!code?.trim()) {
      toast.error("No code to copy!", { autoClose: 2000 });
      return;
    }
    try {
      await navigator.clipboard.writeText(code.trim());
      toast.success("Code copied to clipboard!", { autoClose: 2000 });
    } catch {
      toast.error("Failed to copy code.", { autoClose: 2000 });
    }
  }, []);

  return (
    <Motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.3, staggerChildren: 0.1 },
        },
      }}
      initial="hidden"
      animate="visible"
      className="p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm"
    >
      <div className="space-y-6">
        {Array.isArray(dataStructure.operations) &&
          dataStructure.operations.length > 0 && (
            <section aria-labelledby="operations-heading">
              <h3
                id="operations-heading"
                className="flex items-center gap-2 text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-4"
                data-tooltip-id="operations-tooltip"
                data-tooltip-content="List of operations for this data structure"
              >
                <Code2 size={20} className="text-blue-500" /> Operations
              </h3>
              <Tooltip
                id="operations-tooltip"
                place="top"
                className="z-50 bg-gray-800 text-white text-sm rounded-md px-3 py-1.5"
              />
              <div className="space-y-4">
                {dataStructure.operations.map((operation, index) => (
                  <OperationItem
                    key={index}
                    operation={operation}
                    index={index}
                    isOpen={openOperationIndex === index}
                    onToggle={toggleOperation}
                    isAdmin={isAdmin}
                    themeMode={themeMode}
                    copyCode={copyCode}
                  />
                ))}
              </div>
            </section>
          )}
      </div>
    </Motion.div>
  );
};

export default DataStructureOperations;
