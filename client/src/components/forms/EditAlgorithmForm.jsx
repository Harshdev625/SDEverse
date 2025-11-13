import { useState } from "react";
import { Trash2, Plus, ChevronDown } from "lucide-react";
import MonacoEditor from "@monaco-editor/react";
import AlgorithmPreview from "../../components/preview/AlgorithmPreview";
import { useSelector } from "react-redux";

const EditAlgorithmForm = ({ algorithm = {}, onSave, onCancel, categories }) => {
  const themeMode = useSelector((state) => state.theme.mode);
  const [editedData, setEditedData] = useState({
    title: algorithm.title || "",
    problemStatement: algorithm.problemStatement || "",
    intuition: algorithm.intuition || "",
    explanation: algorithm.explanation || "",
    complexity: algorithm.complexity || { time: "", space: "" },
    difficulty: algorithm.difficulty || "Easy",
    category: algorithm.category || [],
    tags: algorithm.tags || [],
    links: algorithm.links || [],
    codes: algorithm.codes?.length ? algorithm.codes : [{ language: "", code: "" }],
  });

  const [preview, setPreview] = useState(false);
  const [selectedCodeIndex, setSelectedCodeIndex] = useState(0);
  const [showDifficultyDropdown, setShowDifficultyDropdown] = useState(false);

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
    if (field === "codes" && editedData.codes.length === 1) return;
    const updated = editedData[field].filter((_, i) => i !== index);
    handleChange(field, updated);
    if (field === "codes") {
      if (index === selectedCodeIndex && index > 0) setSelectedCodeIndex(index - 1);
      else if (selectedCodeIndex >= updated.length) setSelectedCodeIndex(Math.max(updated.length - 1, 0));
    }
  };

  const calculateEditorHeight = (code) => Math.max(200, code.split("\n").length * 20 + 40);

  const renderInput = (label, value, onChange, multiline = false) => (
    <div className="space-y-2 w-full">
      <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200">
        {label}
      </label>
      {multiline ? (
        <textarea
          className="w-full p-3 text-base border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={5}
        />
      ) : (
        <input
          type="text"
          className="w-full p-3 text-base border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );

  const renderDropdown = (label, options, selected, setSelected, isOpen, setOpen) => (
    <div className="space-y-2 w-full">
      <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200">
        {label}
      </label>
      <div className="relative">
        <button
          onClick={() => setOpen(!isOpen)}
          className="w-full px-4 py-3 text-base text-left rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
        >
          <span>{selected || `Select ${label.toLowerCase()}`}</span>
          <ChevronDown className={`transform transition-transform ${isOpen ? "rotate-180" : ""}`} size={18} />
        </button>
        {isOpen && (
          <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600 max-h-60 overflow-auto">
            {options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setSelected(opt);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  selected === opt ? "bg-blue-50 dark:bg-blue-900/30 font-medium" : ""
                }`}
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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        {/* Header with tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex">
            <button
              onClick={() => setPreview(false)}
              className={`px-6 py-4 font-medium text-sm border-b-2 ${!preview ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 dark:text-gray-400"}`}
            >
              Edit
            </button>
            <button
              onClick={() => setPreview(true)}
              className={`px-6 py-4 font-medium text-sm border-b-2 ${preview ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-gray-500 dark:text-gray-400"}`}
            >
              Preview
            </button>
          </div>
        </div>

        <div className="p-6">
          {preview ? (
            <AlgorithmPreview algorithm={editedData} />
          ) : (
            <div className="space-y-6">
              {renderInput("Title", editedData.title, (val) => handleChange("title", val))}
              
              {renderInput("Problem Statement", editedData.problemStatement, (val) => handleChange("problemStatement", val), true)}
              
              {renderInput("Intuition", editedData.intuition, (val) => handleChange("intuition", val), true)}
              
              {renderInput("Explanation", editedData.explanation, (val) => handleChange("explanation", val), true)}

              {/* Complexity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {["time", "space"].map((key) => (
                  <div className="space-y-2" key={key}>
                    <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 capitalize">
                      {key} Complexity
                    </label>
                    <input
                      type="text"
                      className="w-full p-3 text-base border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={editedData.complexity[key]}
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
                "Difficulty",
                ["Easy", "Medium", "Hard"],
                editedData.difficulty,
                (val) => handleChange("difficulty", val),
                showDifficultyDropdown,
                setShowDifficultyDropdown
              )}

              {/* Categories */}
              <div className="space-y-2">
                <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200">Categories</label>
                <div className="flex flex-wrap gap-2">
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
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          isSelected
                            ? "bg-blue-600 text-white hover:bg-blue-700"
                            : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                        }`}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tags & Links */}
              {["tags", "links"].map((field) => (
                <div key={field} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200 capitalize">
                      {field}
                    </label>
                    <button
                      onClick={() => addArrayItem(field)}
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
                    >
                      <Plus size={14} /> Add
                    </button>
                  </div>
                  <div className="space-y-2">
                    {editedData[field].map((item, i) => (
                      <div key={i} className="flex gap-2 items-center">
                        <input
                          value={item}
                          onChange={(e) => updateArrayItem(field, i, e.target.value)}
                          className="flex-1 p-2 text-base border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          onClick={() => removeArrayItem(field, i)}
                          className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 rounded-full transition-colors"
                          aria-label={`Remove ${field.slice(0, -1)}`}
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {/* Code Snippets */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-lg font-semibold text-gray-800 dark:text-gray-200">Code Snippets</label>
                  <button
                    onClick={() => addArrayItem("codes", { language: "", code: "" })}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-1 transition-colors"
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  {editedData.codes.map((code, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedCodeIndex(index)}
                      className={`px-4 py-2 text-sm font-mono rounded-lg transition-colors ${
                        selectedCodeIndex === index
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600"
                      }`}
                    >
                      {code.language || `Lang ${index + 1}`}
                    </button>
                  ))}
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Language (e.g., JavaScript)"
                      value={editedData.codes[selectedCodeIndex].language}
                      onChange={(e) => {
                        const updated = [...editedData.codes];
                        updated[selectedCodeIndex].language = e.target.value;
                        handleChange("codes", updated);
                      }}
                      className="flex-grow p-2 text-base border rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {editedData.codes.length > 1 && (
                      <button
                        onClick={() => removeArrayItem("codes", selectedCodeIndex)}
                        className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-2 rounded-full transition-colors"
                        aria-label="Remove code snippet"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                  
                  <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                    <MonacoEditor
                      height={calculateEditorHeight(editedData.codes[selectedCodeIndex].code || "")}
                      language={editedData.codes[selectedCodeIndex].language.toLowerCase() || "javascript"}
                      value={editedData.codes[selectedCodeIndex].code}
                      onChange={(code) => {
                        const updated = [...editedData.codes];
                        updated[selectedCodeIndex].code = code;
                        handleChange("codes", updated);
                      }}
                      theme={themeMode === "dark" ? "vs-dark" : "vs-light"}
                      options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: "on",
                        automaticLayout: true,
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4 justify-end pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={onCancel}
                  className="px-6 py-2 text-base rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onSave(editedData)}
                  className="px-6 py-2 text-base rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditAlgorithmForm;