import React, { useState, useRef, useEffect } from "react";

const ScrollableDropdown = ({
  label,
  options = [],
  selectedValue,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Inject dark scrollbar styles (light theme stays default)
  useEffect(() => {
    const style = document.createElement("style");
    style.innerHTML = `
      /* Dark theme custom scrollbar */
      .dark .scrollbar-dark::-webkit-scrollbar {
        width: 8px;
      }
      .dark .scrollbar-dark::-webkit-scrollbar-track {
        background: #1e293b; /* dark background */
      }
      .dark .scrollbar-dark::-webkit-scrollbar-thumb {
        background-color: #475569; /* gray thumb */
        border-radius: 10px;
      }
      .dark .scrollbar-dark::-webkit-scrollbar-thumb:hover {
        background-color: #64748b; /* lighter gray on hover */
      }

      /* Firefox (dark mode only) */
      .dark .scrollbar-dark {
        scrollbar-width: thin;
        scrollbar-color: #475569 #1e293b;
      }
    `;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  return (
    <div className="relative w-48" ref={dropdownRef}>
      {/* Dropdown Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="border border-gray-300 dark:border-gray-600 
                   bg-white dark:bg-gray-800 text-gray-900 dark:text-white 
                   rounded-md px-3 py-2 shadow-sm w-full 
                   flex justify-between items-center focus:ring-2 focus:ring-blue-500 
                   focus:outline-none transition appearance-none"
      >
        <span className="truncate">{selectedValue || label}</span>

        {/* ▼ Arrow */}
        <svg
          className={`w-4 h-4 ml-2 text-gray-500 dark:text-gray-400 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute z-20 mt-1 w-full max-h-48 overflow-y-auto rounded-md 
                     border border-gray-300 dark:border-gray-700 
                     bg-white dark:bg-gray-800 
                     shadow-lg scrollbar-dark"
        >
          {options.map((option) => (
            <div
              key={option}
              onClick={() => {
                onSelect(option);
                setIsOpen(false);
              }}
              className={`px-3 py-2 cursor-pointer hover:bg-blue-100 dark:hover:bg-gray-700 
                          ${
                            option === selectedValue
                              ? "bg-blue-50 dark:bg-gray-700"
                              : ""
                          }`}
            >
              {option}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScrollableDropdown;
