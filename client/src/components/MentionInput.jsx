import React, { useState, useEffect, useRef } from "react";
import { searchUsers } from "../features/user/userAPI";

const MentionInput = ({ 
  value, 
  onChange, 
  placeholder = "Write a comment...", 
  className = "",
  rows = 4,
  ...props 
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [hasUserTyped, setHasUserTyped] = useState(false);
  const textareaRef = useRef(null);
  const suggestionRef = useRef(null);

  const fetchSuggestions = async (q) => {
    try {
      const data = await searchUsers(q);
      setSuggestions(data);
      setShowSuggestions(data.length > 0);
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Debounce fetching suggestions
  useEffect(() => {
    const timeout = setTimeout(() => {
      // Only fetch suggestions if user has actually typed something
      if (hasUserTyped) {
        fetchSuggestions(query);
      }
    }, query === "" ? 0 : 300); // No delay for empty query (immediate @sdeverse)
    return () => clearTimeout(timeout);
  }, [query, hasUserTyped]);

  // Detect @mentions
  useEffect(() => {
    const match = value.match(/@([a-zA-Z0-9_]*)$/);
    if (match) {
      const queryText = match[1];
      setQuery(queryText);
      setHasUserTyped(true); // User has typed something
    } else {
      setQuery("");
      setShowSuggestions(false);
      setHasUserTyped(false); // Reset when no @ mention
    }
  }, [value]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionRef.current &&
        !suggestionRef.current.contains(event.target) &&
        !textareaRef.current?.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  function handleSelect(username) {
    const newText = value.replace(/@([a-zA-Z0-9_]*)$/, `@${username} `);
    onChange(newText);
    setShowSuggestions(false);
    
    // Focus back to textarea
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 0);
  }

  function handleKeyDown(e) {
    if (showSuggestions && suggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        // Handle arrow navigation if needed
      } else if (e.key === "Escape") {
        setShowSuggestions(false);
      }
    }
  }

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        className={`w-full border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-gray-900 dark:text-gray-100 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md ${className}`}
        placeholder={placeholder}
        rows={rows}
        spellCheck={false}
        {...props}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div
          ref={suggestionRef}
          className="absolute bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg mt-1 max-h-48 overflow-auto w-64 z-50"
        >
          {suggestions.map((user) => (
            <div
              key={user._id}
              onClick={() => handleSelect(user.username)}
              className="px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center gap-2 border-b border-gray-200 dark:border-gray-600 last:border-b-0"
            >
              <img
                src={user.avatarUrl || "/default-avatar.png"}
                alt={user.username}
                className="w-6 h-6 rounded-full object-cover"
              />
              <span className="text-sm text-gray-900 dark:text-gray-100">
                @{user.username}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MentionInput;
