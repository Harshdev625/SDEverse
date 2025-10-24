import { useState, useEffect, useRef } from "react";
import { Trash2, Plus, ChevronDown, Info } from "lucide-react";
import MonacoEditor from "@monaco-editor/react";
import AlgorithmPreview from "../../pages/AlgorithmPreview"; // Assuming this path is correct
import clsx from "clsx"; // For conditional class joining
import { useSelector } from "react-redux";
import isEqual from "lodash/isEqual";

const defaultFormData = {
  title: "",
  problemStatement: "",
  intuition: "",
  explanation: "",
  complexity: { time: "", space: "" },
  difficulty: "Easy",
  category: [],
  tags: [],
  links: [],
  codes: [{ language: "", code: "" }],
};

const ProposalForm = ({ proposal = {}, onSave, categories = [], mode }) => {
  const themeMode = useSelector((state) => state.theme.mode);
 const [editedData, setEditedData] = useState({
    ...defaultFormData,
    ...proposal,
    codes: proposal.codes?.length ? proposal.codes : [{ language: "", code: "" }],
  });

  const [selectedCodeIndex, setSelectedCodeIndex] = useState(0);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);
  const [showInfo, setShowInfo] = useState(true);

  const prevProposalRef = useRef(null);

  // Ref to store the latest onSave callback
  const onSaveRef = useRef(onSave);
useEffect(() => {
  onSaveRef.current = onSave;
}, [onSave]);

  // Effect to call onSave whenever editedData changes
  useEffect(() => {
  const timeout = setTimeout(() => {
    onSaveRef.current(editedData);
  }, 500);
  return () => clearTimeout(timeout);
}, [editedData]);


  // Effect to update internal state when proposal prop changes (for EditProposal)
  useEffect(() => {
  if (!proposal) return;

  if (!isEqual(prevProposalRef.current, proposal)) {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEditedData({
      ...defaultFormData,
      ...proposal,
      codes: proposal.codes?.length ? proposal.codes : [{ language: "", code: "" }],
    });

    setSelectedCodeIndex(
      proposal.codes?.length
        ? Math.min(selectedCodeIndex, proposal.codes.length - 1)
        : 0
    );

    prevProposalRef.current = proposal;
  }
}, [proposal]);



  const handleChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
  };

  const updateArrayItem = (field, index, value) => {
    const updated = [...editedData[field]];
    updated[index] = value;
    handleChange(field, updated);
  };

  const addArrayItem = (field, defaultValue = "") => {
    const updated = [...editedData[field], defaultValue];
    handleChange(field, updated);
    if (field === "codes") setSelectedCodeIndex(updated.length - 1);
  };

  const removeArrayItem = (field, index) => {
    if (field === "codes" && editedData.codes.length === 1) return; // Prevent removing the last code snippet
    const updated = editedData[field].filter((_, i) => i !== index);
    handleChange(field, updated);
    if (field === "codes") {
      if (index === selectedCodeIndex && index > 0) setSelectedCodeIndex(index - 1);
      else if (selectedCodeIndex >= updated.length)
        setSelectedCodeIndex(Math.max(updated.length - 1, 0));
    }
  };

  const calculateEditorHeight = (code) => Math.max(300, code.split("\n").length * 20 + 40);

  const renderInput = (label, value, onChange, multiline = false, placeholder = "") => (
    <div className="space-y-3 w-full">
      <label htmlFor={label.toLowerCase().replace(/\s/g, "")} className="block text-base font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      {multiline ? (
        <textarea
          id={label.toLowerCase().replace(/\s/g, "")}
          className="w-full p-4 text-base rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm resize-y"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
          placeholder={placeholder}
        />
      ) : (
        <input
          id={label.toLowerCase().replace(/\s/g, "")}
          type="text"
          className="w-full p-4 text-base rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all shadow-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );

  const renderDropdown = (label, options, selected, setSelected, isOpen, setOpen) => (
    <div className="space-y-3 w-full">
      <label className="block text-base font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        <button
          onClick={() => setOpen(!isOpen)}
          className="w-full px-4 py-3 text-base text-left rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 flex items-center justify-between shadow-sm"
          type="button"
        >
          <span className="truncate">{selected || `Select ${label.toLowerCase()}`}</span>
          <ChevronDown className={clsx("transform transition-transform", isOpen && "rotate-180")} size={18} />
        </button>
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-300 dark:border-gray-600 max-h-60 overflow-y-auto">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setSelected(opt);
                  setOpen(false);
                }}
                className={clsx(
                  "w-full px-4 py-3 text-left text-base hover:bg-gray-100 dark:hover:bg-gray-700",
                  selected === opt && "bg-blue-50 dark:bg-blue-900/30 font-medium"
                )}
                type="button"
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-[500px]"> {/* Added min-height for better layout during preview */}
      {mode === "edit" ? (
        <div className="space-y-8">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Proposal Details</h2>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-full"
              aria-label="Toggle information"
            >
              <Info size={24} />
            </button>
          </div>

          {showInfo && (
            <div className="mt-4 p-5 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
              <h3 className="font-semibold text-blue-800 dark:text-blue-200 mb-2 flex items-center gap-2">
                <Info size={18} /> How to submit a great algorithm
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                <li>Ensure your algorithm solves a common problem in computer science</li>
                <li>Provide clear explanations with step-by-step reasoning</li>
                <li>Include multiple implementations in different programming languages</li>
                <li>Add relevant complexity analysis and real-world applications</li>
                <li>Tag your algorithm with appropriate categories and difficulty level</li>
                <li>All submissions will be reviewed by our team before publishing</li>
              </ul>
            </div>
          )}

          {renderInput("Algorithm Title", editedData.title,
            (val) => handleChange("title", val),
            false,
            "e.g., Dijkstra's Shortest Path Algorithm"
          )}

          {renderInput("Problem Statement", editedData.problemStatement,
            (val) => handleChange("problemStatement", val),
            true,
            "Describe the problem this algorithm solves..."
          )}

          {renderInput("Intuition", editedData.intuition,
            (val) => handleChange("intuition", val),
            true,
            "Explain the core idea behind the solution..."
          )}

          {renderInput("Detailed Explanation", editedData.explanation,
            (val) => handleChange("explanation", val),
            true,
            "Provide step-by-step explanation with examples..."
          )}

          {/* Complexity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {["time", "space"].map((key) => (
              <div className="space-y-3" key={key}>
                <label htmlFor={`${key}-complexity`} className="block text-base font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {key} Complexity
                </label>
                <input
                  id={`${key}-complexity`}
                  type="text"
                  className="w-full p-4 text-base rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  value={editedData.complexity[key]}
                  placeholder={`O(...)`}
                  onChange={(e) =>
                    setEditedData((prev) => ({
                      ...prev,
                      complexity: { ...prev.complexity, [key]: e.target.value },
                    }))
                  }
                />
              </div>
            ))}
          </div>

          {renderDropdown(
            "Difficulty Level",
            ["Easy", "Medium", "Hard"],
            editedData.difficulty,
            (val) => handleChange("difficulty", val),
            showDifficultyDropdown,
            setShowDifficultyDropdown
          )}

          {/* Categories */}
          <div className="space-y-3">
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300">Categories</label>
            <div className="flex flex-wrap gap-3">
              {categories.map((cat) => {
                const isSelected = editedData.category.includes(cat);
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      const updated = isSelected
                        ? editedData.category.filter((c) => c !== cat)
                        : [...editedData.category, cat];
                      handleChange("category", updated);
                    }}
                    className={clsx(
                      "px-4 py-2 rounded-xl text-sm font-medium transition-colors",
                      isSelected
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                    )}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tags & Links */}
          {["tags", "links"].map((field) => (
            <div key={field} className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-base font-medium text-gray-700 dark:text-gray-300 capitalize">
                  {field === "tags" ? "Related Tags" : "Reference Links"}
                </label>
                <button
                  onClick={() => addArrayItem(field, field === "links" ? "https://" : "")}
                  className="text-sm px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-md"
                  type="button"
                >
                  <Plus size={16} /> Add
                </button>
              </div>
              <div className="space-y-3">
                {editedData[field].map((item, i) => (
                  <div key={i} className="flex gap-3 items-center">
                    <input
                      value={item}
                      onChange={(e) => updateArrayItem(field, i, e.target.value)}
                      className="flex-1 p-3 text-base rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                      placeholder={
                        field === "tags"
                          ? "e.g., graph, sorting, dynamic programming"
                          : "https://example.com"
                      }
                    />
                    <button
                      onClick={() => removeArrayItem(field, i)}
                      className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-2 rounded-full transition-colors"
                      aria-label={`Remove ${field.slice(0, -1)}`}
                      type="button"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Code Snippets */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Code Implementations</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  Add implementations in different programming languages
                </p>
              </div>
              <button
                onClick={() => addArrayItem("codes", { language: "", code: "" })}
                className="text-sm px-4 py-2.5 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors flex items-center gap-2 shadow-md"
                type="button"
              >
                <Plus size={16} /> Add Implementation
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              {editedData.codes.map((code, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedCodeIndex(index)}
                  className={clsx(
                    "px-4 py-2.5 text-sm font-medium rounded-xl transition-all",
                    selectedCodeIndex === index
                      ? "bg-blue-600 text-white shadow-md"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  )}
                  type="button"
                >
                  {code.language || `Implementation ${index + 1}`}
                </button>
              ))}
            </div>

            {editedData.codes.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Programming Language (e.g., JavaScript, Python, C++)"
                    value={editedData.codes[selectedCodeIndex]?.language || ""}
                    onChange={(e) => {
                      const updated = [...editedData.codes];
                      updated[selectedCodeIndex].language = e.target.value;
                      handleChange("codes", updated);
                    }}
                    className="flex-grow p-4 text-base rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                  />
                  {editedData.codes.length > 1 && (
                    <button
                      onClick={() => removeArrayItem("codes", selectedCodeIndex)}
                      className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 p-3 rounded-xl transition-colors bg-red-50 dark:bg-red-900/20"
                      aria-label="Remove code snippet"
                      type="button"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>

                <div className="rounded-xl overflow-hidden border border-gray-300 dark:border-gray-600 shadow-lg">
                  <MonacoEditor
                    height={calculateEditorHeight(editedData.codes[selectedCodeIndex]?.code || "")}
                    language={editedData.codes[selectedCodeIndex]?.language.toLowerCase() || "javascript"}
                    value={editedData.codes[selectedCodeIndex]?.code || ""}
                    onChange={(code) => {
                      const updated = [...editedData.codes];
                      updated[selectedCodeIndex].code = code;
                      handleChange("codes", updated);
                    }}
                    theme={themeMode === "dark" ? "vs-dark" : "vs-light"}
                    options={{
                      minimap: { enabled: false },
                      fontSize: 16,
                      wordWrap: "on",
                      automaticLayout: true,
                      scrollBeyondLastLine: false,
                      padding: { top: 20 },
                      suggestOnTriggerCharacters: true,
                      tabSize: 2,
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
          {/* Ensure AlgorithmPreview handles potentially empty data gracefully */}
          <AlgorithmPreview algorithm={editedData} />
        </div>
      )}
    </div>
  );
};

export default ProposalForm;