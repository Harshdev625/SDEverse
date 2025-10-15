import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";
import { useSelector } from "react-redux";

// Helper function to ensure blank lines before lists for correct Markdown rendering
function ensureBlankLineBeforeLists(markdown) {
  const lines = markdown.split("\n");
  const fixedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const current = lines[i];
    const previous = fixedLines[fixedLines.length - 1] || ""; // Check the last added line

    const isListItem = /^(\s*)([-*+]|\d+\.)\s+/.test(current);
    const isPrevEmpty = previous.trim() === "";
    // Check if the previous line is the start or end of a code block (```)
    const isPrevCodeBlockDelimiter = previous.trim().startsWith("```");

    if (isListItem && !isPrevEmpty && !isPrevCodeBlockDelimiter) {
      fixedLines.push(""); // Insert a blank line before the list if needed
    }

    fixedLines.push(current);
  }

  return fixedLines.join("\n");
}

// Markdown rendering component
const MarkdownContentRenderer = ({ content }) => {
  const themeMode = useSelector((state) => state.theme.mode);
  if (!content) return null;

  // Replace escaped newlines and backslashes, then ensure blank lines for lists
  const formattedContent = ensureBlankLineBeforeLists(
    content.replace(/\\n/g, "\n").replace(/\\\\/g, "\\")
  );

  return (
    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <SyntaxHighlighter
                {...props}
                PreTag="div"
                language={match[1]}
                style={themeMode === "dark" ? oneDark : oneLight}
                customStyle={{
                  borderRadius: "0.5rem",
                  padding: "1rem",
                  fontSize: "0.875rem",
                  overflowX: "auto",
                  backgroundColor: themeMode === "dark" ? "#282c34" : "#f8f9fa", // Ensure consistent background for code blocks
                  marginTop: "1rem", // Add spacing above code blocks
                  marginBottom: "1rem", // Add spacing below code blocks
                }}
              >
                {String(children).replace(/\n$/, "")}
              </SyntaxHighlighter>
            ) : (
              <code className="bg-gray-200 dark:bg-gray-700 px-1 py-0.5 rounded text-sm font-mono text-gray-800 dark:text-gray-100">
                {children}
              </code>
            );
          },
          // Custom rendering for headings to ensure consistent styling within markdown
          h1: ({ node, ...props }) => <h1 className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-2xl font-semibold mt-7 mb-3 text-gray-900 dark:text-white" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-xl font-semibold mt-6 mb-2 text-gray-900 dark:text-white" {...props} />,
          p: ({ node, ...props }) => <p className="mb-4 text-base" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 mb-4 space-y-1" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mb-4 space-y-1" {...props} />,
          li: ({ node, ...props }) => <li className="mb-1" {...props} />,
          a: ({ node, ...props }) => <a className="text-blue-600 hover:underline dark:text-blue-400" {...props} />,
          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-4 border-gray-300 pl-4 py-2 italic text-gray-600 dark:text-gray-400 my-4" {...props} />
          ),
          table: ({ node, ...props }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100 dark:bg-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700" {...props} />,
          td: ({ node, ...props }) => <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700" {...props} />,
        }}
      >
        {formattedContent}
      </ReactMarkdown>
    </div>
  );
};

// Renamed for clarity, it's a section wrapper
const AlgorithmContentBlock = ({ title, content }) => {
  if (!content) return null;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8 last:mb-0">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 pb-3 mb-5 border-b border-gray-200 dark:border-gray-700">
        {title}
      </h2>
      <MarkdownContentRenderer content={content} />
    </div>
  );
};

const AlgorithmInfo = ({ algorithm }) => {
  return (
    <div className="space-y-8"> {/* Overall spacing for sections within AlgorithmInfo */}
      <AlgorithmContentBlock title="Problem Statement" content={algorithm.problemStatement} />
      <AlgorithmContentBlock title="Intuition" content={algorithm.intuition} />
      <AlgorithmContentBlock title="Explanation" content={algorithm.explanation} />
    </div>
  );
};

export default AlgorithmInfo;