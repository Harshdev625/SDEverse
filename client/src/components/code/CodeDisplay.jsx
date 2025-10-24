import React, { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark, materialLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";

const CodeDisplay = ({ algorithm }) => {
  const [selectedLangIndex, setSelectedLangIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const themeMode = useSelector((state) => state.theme.mode);

  const handleCopy = () => {
    const code = algorithm.codes?.[selectedLangIndex]?.code || "";
    if (code) {
      navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied to clipboard!", { theme: "dark" });
      setTimeout(() => setCopied(false), 2000);
    } else {
      toast.error("No code to copy!", { theme: "dark" });
    }
  };

  const currentCode = algorithm.codes?.[selectedLangIndex];

  if (!algorithm.codes?.length) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="w-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black text-gray-900 dark:text-gray-100 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mt-4 sm:mt-6"
    >
      <div className="flex flex-wrap justify-between items-center p-3 xs:p-4 sm:p-5 bg-gray-100/70 dark:bg-gray-800/70 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-base xs:text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate flex-1">
          Full Implimentation
        </h2>
        <button
          onClick={handleCopy}
          title="Copy code"
          className="flex items-center gap-1 xs:gap-1.5 px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 bg-indigo-700/80 text-white rounded-lg hover:bg-indigo-600/90 transition-all duration-300 ease-in-out text-xs xs:text-sm sm:text-base font-semibold min-h-[44px] shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900"
        >
          {copied ? (
            <>
              <Check size={18} className="text-green-300" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy size={18} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="flex flex-wrap gap-1 xs:gap-2 border-b border-gray-200/70 dark:border-gray-700/70 bg-gray-50/60 dark:bg-gray-800/60 px-2 xs:px-3 py-1 xs:py-1.5 overflow-x-auto max-w-full">
        {algorithm.codes.map((code, index) => (
          <button
            key={index}
            onClick={() => setSelectedLangIndex(index)}
            className={`
              relative px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 font-mono text-xs xs:text-sm sm:text-base font-medium truncate
              max-w-[100px] xs:max-w-[120px] sm:max-w-[150px] transition-all duration-200 ease-in-out
              min-h-[44px] rounded-md
              ${
                selectedLangIndex === index
                  ? "text-indigo-600 dark:text-indigo-400 bg-indigo-100/60 dark:bg-indigo-900/40"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-200/60 dark:hover:bg-gray-700/40"
              }
              focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-900
            `}
          >
            {code.language}
          </button>
        ))}
      </div>

      <SyntaxHighlighter
        language={currentCode.language?.toLowerCase() || "text"}
        style={themeMode === "dark" ? materialDark : materialLight}
        showLineNumbers
        customStyle={{
          margin: 0,
          padding: "1rem",
          fontSize: "0.95rem",
          lineHeight: "1.6",
          backgroundColor: themeMode === "dark" ? "#1a1a1a" : "#f8f9fa",
          display: "block",
          whiteSpace: "pre",
          overflowX: "auto",
          width: "100%",
          boxSizing: "border-box",
          scrollbarWidth: "thin",
          scrollbarColor: themeMode === "dark" ? "#6b7280 #2d3748" : "#9ca3af #e5e7eb",
          borderRadius: "0 0 0.75rem 0.75rem",
        }}
        codeTagProps={{
          style: {
            whiteSpace: "pre",
            display: "block",
            width: "fit-content",
            minWidth: "100%",
          },
        }}
        lineNumberStyle={{
          paddingRight: "0.9rem",
          width: "2.5rem",
          minWidth: "2.5rem",
          textAlign: "right",
          color: themeMode === "dark" ? "#6b7280" : "#9ca3af",
          boxSizing: "border-box",
          userSelect: "none",
        }}
      >
        {currentCode.code || "// No code available"}
      </SyntaxHighlighter>
    </motion.div>
  );
};

export default CodeDisplay;
