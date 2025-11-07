import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  oneDark,
  oneLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";
import "katex/dist/katex.min.css";
import { useSelector } from "react-redux";

const ensureBlankLineBeforeLists = (markdown) => {
  const lines = markdown.split("\n");
  const fixedLines = [];

  for (let i = 0; i < lines.length; i++) {
    const current = lines[i];
    const previous = fixedLines[fixedLines.length - 1] || "";

    const isListItem = /^(\s*)([-*+]|\d+\.)\s+/.test(current);
    const isPrevEmpty = previous.trim() === "";
    const isPrevCodeBlockDelimiter = previous.trim().startsWith("```");

    if (isListItem && !isPrevEmpty && !isPrevCodeBlockDelimiter) {
      fixedLines.push("");
    }

    fixedLines.push(current);
  }

  return fixedLines.join("\n");
};

const markdownComponents = (themeMode) => ({
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
          backgroundColor: themeMode === "dark" ? "#282c34" : "#f8f9fa",
          marginTop: "1rem",
          marginBottom: "1rem",
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
  h1: ({ children, ...props }) => (
    <h1
      className="text-3xl font-bold mt-8 mb-4 text-gray-900 dark:text-white"
      {...props}
    >
      {children}
    </h1>
  ),
  h2: ({ children, ...props }) => (
    <h2
      className="text-2xl font-semibold mt-7 mb-3 text-gray-900 dark:text-white"
      {...props}
    >
      {children}
    </h2>
  ),
  h3: ({ children, ...props }) => (
    <h3
      className="text-xl font-semibold mt-6 mb-2 text-gray-900 dark:text-white"
      {...props}
    >
      {children}
    </h3>
  ),
  p: ({ children, ...props }) => (
    <p className="mb-4 text-base" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }) => (
    <ul className="list-disc pl-5 mb-4 space-y-1" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }) => (
    <ol className="list-decimal pl-5 mb-4 space-y-1" {...props}>
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => (
    <li className="mb-1" {...props}>
      {children}
    </li>
  ),
  a: ({ children, ...props }) => (
    <a className="text-blue-600 hover:underline dark:text-blue-400" {...props}>
      {children}
    </a>
  ),
  blockquote: ({ children, ...props }) => (
    <blockquote
      className="border-l-4 border-gray-300 pl-4 py-2 italic text-gray-600 dark:text-gray-400 my-4"
      {...props}
    >
      {children}
    </blockquote>
  ),
  table: ({ children, ...props }) => (
    <div className="overflow-x-auto my-4">
      <table
        className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
        {...props}
      >
        {children}
      </table>
    </div>
  ),
  th: ({ children, ...props }) => (
    <th
      className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-100 dark:bg-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700"
      {...props}
    >
      {children}
    </th>
  ),
  td: ({ children, ...props }) => (
    <td
      className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700"
      {...props}
    >
      {children}
    </td>
  ),
});

const MarkdownContentRenderer = ({ content }) => {
  const themeMode = useSelector((state) => state.theme.mode);

  if (!content) return null;

  const formattedContent = ensureBlankLineBeforeLists(
    content.replace(/\\n/g, "\n").replace(/\\\\/g, "\\")
  );

  return (
    <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[
          [remarkMath, { singleDollarTextMath: false }],
          remarkGfm,
        ]}
        rehypePlugins={[
          [
            rehypeKatex,
            {
              throwOnError: false,
              errorColor: "#cc0000",
              displayMode: true,
              fleqn: false,
              macros: {
                "\\RR": "\\mathbb{R}",
                "\\NN": "\\mathbb{N}",
                "\\ZZ": "\\mathbb{Z}",
                "\\QQ": "\\mathbb{Q}",
                "\\CC": "\\mathbb{C}",
              },
              trust: true,
              strict: false,
            },
          ],
        ]}
        components={markdownComponents(themeMode)}
      >
        {formattedContent}
      </ReactMarkdown>
    </div>
  );
};

const AlgorithmContentBlock = ({ title, content }) => (
  <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-8 last:mb-0">
    <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 pb-3 mb-5 border-b border-gray-200 dark:border-gray-700">
      {title}
    </h2>
    {content ? (
      <MarkdownContentRenderer content={content} />
    ) : (
      <p className="text-gray-500 dark:text-gray-400 italic">Not provided</p>
    )}
  </div>
);

const AlgorithmInfo = ({ algorithm }) => (
  <div className="space-y-8">
    <AlgorithmContentBlock
      title="Problem Statement"
      content={algorithm.problemStatement}
    />
    <AlgorithmContentBlock title="Intuition" content={algorithm.intuition} />
    <AlgorithmContentBlock
      title="Explanation"
      content={algorithm.explanation}
    />
  </div>
);

export default AlgorithmInfo;
