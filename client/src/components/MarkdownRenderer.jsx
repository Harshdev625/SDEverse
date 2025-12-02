import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus, prism } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { useSelector } from 'react-redux';
import { Check, Copy } from 'lucide-react';
import clsx from 'clsx';
import 'katex/dist/katex.min.css';

const CodeBlock = ({ language, code, isDark }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="my-5 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm relative group">
      <div className="bg-gray-100 dark:bg-gray-800 px-4 py-2 text-xs font-mono text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <span>{language}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={14} />
              <span className="text-xs">Copied!</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span className="text-xs">Copy</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        style={isDark ? vscDarkPlus : prism}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: isDark ? '#1e1e1e' : '#fafafa',
          padding: '1rem',
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
};

const MarkdownRenderer = ({ content, className = '' }) => {
  const { mode } = useSelector((state) => state.theme);
  const isDark = mode === 'dark';

  const components = {
    // Headings with proper styling
    h1: ({ ...props }) => (
      <h1
        className="text-4xl font-extrabold mt-8 mb-4 pb-3 border-b-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-50 scroll-mt-20"
        {...props}
      />
    ),
    h2: ({ ...props }) => (
      <h2
        className="text-3xl font-bold mt-8 mb-3 pb-2 border-b border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-50 scroll-mt-20"
        {...props}
      />
    ),
    h3: ({ ...props }) => (
      <h3
        className="text-2xl font-bold mt-6 mb-3 text-gray-900 dark:text-gray-50 scroll-mt-20"
        {...props}
      />
    ),
    h4: ({ ...props }) => (
      <h4
        className="text-xl font-semibold mt-5 mb-2 text-gray-900 dark:text-gray-50 scroll-mt-20"
        {...props}
      />
    ),
    h5: ({ ...props }) => (
      <h5
        className="text-lg font-semibold mt-4 mb-2 text-gray-900 dark:text-gray-100 scroll-mt-20"
        {...props}
      />
    ),
    h6: ({ ...props }) => (
      <h6
        className="text-base font-semibold mt-3 mb-2 text-gray-900 dark:text-gray-100 scroll-mt-20"
        {...props}
      />
    ),

    // Paragraphs
    p: ({ ...props }) => (
      <p className="mb-4 leading-7 text-gray-700 dark:text-gray-300" {...props} />
    ),

    // Links
    a: ({ ...props }) => (
      <a
        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline decoration-blue-500/30 hover:decoration-blue-500 transition-colors font-medium"
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      />
    ),

    // Lists
    ul: ({ ...props }) => (
      <ul className="mb-4 ml-6 list-disc space-y-2 text-gray-700 dark:text-gray-300" {...props} />
    ),
    ol: ({ ...props }) => (
      <ol className="mb-4 ml-6 list-decimal space-y-2 text-gray-700 dark:text-gray-300" {...props} />
    ),
    li: ({ ...props }) => (
      <li className="leading-7" {...props} />
    ),

    // Blockquotes
    blockquote: ({ ...props }) => (
      <blockquote
        className="my-4 pl-4 pr-4 py-3 border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-900/20 rounded-r italic text-gray-700 dark:text-gray-300"
        {...props}
      />
    ),

    // Code blocks and inline code
    code: ({ inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';

      if (!inline && language) {
        return (
          <CodeBlock
            language={language}
            code={String(children).replace(/\n$/, '')}
            isDark={isDark}
          />
        );
      }

      // Inline code
      return (
        <code
          className="px-1.5 py-0.5 mx-0.5 rounded text-sm font-mono bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800"
          {...props}
        >
          {children}
        </code>
      );
    },

    // Pre (fallback for code blocks without language)
    pre: ({ ...props }) => (
      <pre className="my-5 p-4 rounded-lg overflow-x-auto bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 text-sm font-mono" {...props} />
    ),

    // Tables
    table: ({ ...props }) => (
      <div className="my-6 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props} />
      </div>
    ),
    thead: ({ ...props }) => (
      <thead className="bg-gray-50 dark:bg-gray-800" {...props} />
    ),
    tbody: ({ ...props }) => (
      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700" {...props} />
    ),
    tr: ({ ...props }) => (
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors" {...props} />
    ),
    th: ({ ...props }) => (
      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 uppercase tracking-wider" {...props} />
    ),
    td: ({ ...props }) => (
      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300" {...props} />
    ),

    // Horizontal rule
    hr: ({ ...props }) => (
      <hr className="my-8 border-t-2 border-gray-200 dark:border-gray-700" {...props} />
    ),

    // Images
    img: ({ ...props }) => (
      <img
        className="my-6 rounded-xl shadow-lg max-w-full h-auto"
        loading="lazy"
        {...props}
      />
    ),

    // Strong/Bold
    strong: ({ ...props }) => (
      <strong className="font-bold text-gray-900 dark:text-gray-50" {...props} />
    ),

    // Emphasis/Italic
    em: ({ ...props }) => (
      <em className="italic text-gray-800 dark:text-gray-200" {...props} />
    ),

    // Delete/Strikethrough
    del: ({ ...props }) => (
      <del className="line-through text-gray-500 dark:text-gray-500" {...props} />
    ),
  };

  return (
    <div className={clsx('markdown-content', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
