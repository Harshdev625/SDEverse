import { useState, useEffect, useRef } from "react";
import MonacoEditor from "@monaco-editor/react";
import { Plus, Trash2, XCircle, Info } from "lucide-react";
import DataStructurePreview from "../../components/preview/DataStructurePreview";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import clsx from "clsx";

const DATA_STRUCTURE_TYPES = ["Linear", "Non-Linear", "Hierarchical", "Graph", "Other"];

const renderInput = (label, value, onChange, isTextArea, placeholder, id, type = "text", rows = 4, required = false, error = false) => (
  <div className="space-y-2">
    <label htmlFor={id} className="block text-base font-medium text-gray-800 dark:text-gray-200">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {isTextArea ? (
      <textarea
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value.trim())}
        placeholder={placeholder}
        rows={rows}
        required={required}
        className={`w-full p-3 rounded-lg bg-white dark:bg-gray-900 border ${error ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors duration-200`}
      />
    ) : (
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value.trim())}
        placeholder={placeholder}
        required={required}
        className={`w-full p-3 rounded-lg bg-white dark:bg-gray-900 border ${error ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors duration-200`}
      />
    )}
    {error && <p className="text-red-500 text-sm">{`${label} is required`}</p>}
  </div>
);

const calculateEditorHeight = (code) => {
  const lines = code ? code.split("\n").length : 12;
  return Math.max(300, Math.min(800, lines * 24));
};

const DataStructureProposalForm = ({ proposal = {}, onSave, categories = [], mode, dataStructures = [] }) => {
  const themeMode = useSelector((state) => state.theme.mode);
  const [editedData, setEditedData] = useState(() => ({
    title: proposal.title || "",
    definition: proposal.definition || "",
    category: proposal.category || [],
    type: proposal.type || "",
    characteristics: proposal.characteristics || "",
    visualization: proposal.visualization || "",
    operations: proposal.operations?.length > 0 ? proposal.operations : [
      { name: "", description: "", complexity: { time: "", space: "" }, implementations: [{ language: "", code: "", explanation: "", complexity: { time: "", space: "" } }] }
    ],
    fullImplementations: proposal.fullImplementations?.length > 0 ? proposal.fullImplementations : [{ language: "", code: "" }],
    applications: proposal.applications?.length > 0 ? proposal.applications : [{ domain: "", examples: [""] }],
    comparisons: proposal.comparisons?.length > 0 ? proposal.comparisons : [{ with: "", advantages: [""], disadvantages: [""], whenToUse: "" }],
    tags: proposal.tags || [],
    references: proposal.references || [],
    videoLinks: proposal.videoLinks || [],
    targetDataStructure: proposal.targetDataStructure || null,
  }));
  const [errors, setErrors] = useState({});
  const [showInfo, setShowInfo] = useState(true);
  const [selectedCodeIndex, setSelectedCodeIndex] = useState(0);

  // Ref to store the latest onSave callback
  const onSaveRef = useRef(onSave);
  const prevDataRef = useRef();

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Call onSave when editedData changes
  useEffect(() => {
    if (JSON.stringify(editedData) !== JSON.stringify(prevDataRef.current)) {
      prevDataRef.current = editedData;
      onSaveRef.current(editedData);
    }
  }, [editedData]);

  const validate = () => {
    const newErrors = {};
    if (!editedData.title.trim()) newErrors.title = true;
    if (!editedData.definition.trim()) newErrors.definition = true;
    if (!editedData.type) newErrors.type = true;
    if (!editedData.characteristics.trim()) newErrors.characteristics = true;
    if (!editedData.category.length) newErrors.category = true;
    editedData.category.forEach((cat) => {
      if (!categories.includes(cat)) newErrors[`cat-${cat}`] = true;
    });

    editedData.operations.forEach((op, i) => {
      if (!op.name.trim()) newErrors[`op-${i}-name`] = true;
      if (!op.description.trim()) newErrors[`op-${i}-description`] = true;
      if (!op.complexity.time.trim()) newErrors[`op-${i}-time`] = true;
      if (!op.complexity.space.trim()) newErrors[`op-${i}-space`] = true;
      op.implementations.forEach((impl, j) => {
        if (!impl.language.trim()) newErrors[`op-${i}-impl-${j}-language`] = true;
        if (!impl.code.trim()) newErrors[`op-${i}-impl-${j}-code`] = true;
        if (!impl.explanation.trim()) newErrors[`op-${i}-impl-${j}-explanation`] = true;
        if (!impl.complexity.time.trim()) newErrors[`op-${i}-impl-${j}-time`] = true;
        if (!impl.complexity.space.trim()) newErrors[`op-${i}-impl-${j}-space`] = true;
      });
    });

    editedData.fullImplementations.forEach((impl, i) => {
      if (!impl.language.trim()) newErrors[`fullImpl-${i}-language`] = true;
      if (!impl.code.trim()) newErrors[`fullImpl-${i}-code`] = true;
    });

    editedData.applications.forEach((app, i) => {
      if (!app.domain.trim()) newErrors[`app-${i}-domain`] = true;
      if (!app.examples.some((ex) => ex.trim())) newErrors[`app-${i}-examples`] = true;
    });

    editedData.comparisons.forEach((comp, i) => {
      if (!comp.with.trim()) newErrors[`comp-${i}-with`] = true;
      if (!comp.whenToUse.trim()) newErrors[`comp-${i}-whenToUse`] = true;
      if (!comp.advantages.some((adv) => adv.trim())) newErrors[`comp-${i}-advantages`] = true;
      if (!comp.disadvantages.some((dis) => dis.trim())) newErrors[`comp-${i}-disadvantages`] = true;
    });

    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleChange = (field, value) => {
    setEditedData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const addArrayItem = (field, newItem) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: [...prev[field], newItem],
    }));
  };

  const removeArrayItem = (field, index) => {
    if (["operations", "fullImplementations", "applications", "comparisons"].includes(field) && editedData[field].length === 1) {
      toast.warn(`At least one ${field.slice(0, -1)} is required.`);
      return;
    }
    setEditedData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith(`${field}-${index}`)) delete newErrors[key];
      });
      return newErrors;
    });
  };

  const updateArrayItem = (field, index, newValue) => {
    setEditedData((prev) => ({
      ...prev,
      [field]: prev[field].map((item, i) => (i === index ? newValue : item)),
    }));
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith(`${field}-${index}`)) delete newErrors[key];
      });
      return newErrors;
    });
  };

  const updateNestedArrayItem = (field, index, nestedField, nestedIndex, value) => {
    setEditedData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = {
        ...newArray[index],
        [nestedField]: newArray[index][nestedField].map((item, i) => (i === nestedIndex ? value : item)),
      };
      return { ...prev, [field]: newArray };
    });
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.includes(`${field}-${index}-${nestedField}-${nestedIndex}`)) delete newErrors[key];
      });
      return newErrors;
    });
  };

  const addNestedArrayItem = (field, index, nestedField, newItem) => {
    setEditedData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = {
        ...newArray[index],
        [nestedField]: [...newArray[index][nestedField], newItem],
      };
      return { ...prev, [field]: newArray };
    });
  };

  const removeNestedArrayItem = (field, index, nestedField, nestedIndex) => {
    if (["implementations", "examples", "advantages", "disadvantages"].includes(nestedField) && editedData[field][index][nestedField].length === 1) {
      toast.warn(`At least one ${nestedField.slice(0, -1)} is required.`);
      return;
    }
    setEditedData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = {
        ...newArray[index],
        [nestedField]: newArray[index][nestedField].filter((_, i) => i !== nestedIndex),
      };
      return { ...prev, [field]: newArray };
    });
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.includes(`${field}-${index}-${nestedField}-${nestedIndex}`)) delete newErrors[key];
      });
      return newErrors;
    });
  };

  const handleMultiSelectChange = (field, value, isChecked) => {
    setEditedData((prev) => {
      const currentArray = prev[field] || [];
      const newArray = isChecked ? [...new Set([...currentArray, value])] : currentArray.filter((item) => item !== value);
      return { ...prev, [field]: newArray };
    });
    if (field === "category") setErrors((prev) => ({ ...prev, category: false, [`cat-${value}`]: false }));
  };

  return (
    <div className="min-h-[500px]">
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
                <Info size={18} /> How to submit a great data structure
              </h3>
              <ul className="list-disc pl-5 space-y-1 text-blue-700 dark:text-blue-300 text-sm">
                <li>Ensure your data structure solves a common problem in computer science</li>
                <li>Provide clear definitions and characteristics of the data structure</li>
                <li>Include comprehensive operations with time/space complexity analysis</li>
                <li>Add real-world applications and use cases</li>
                <li>Tag your data structure with appropriate categories and types</li>
                <li>All submissions are reviewed by our team</li>
              </ul>
            </div>
          )}

          {renderInput("Title", editedData.title, (val) => handleChange("title", val))}
          {renderInput(
            "Definition",
            editedData.definition,
            (val) => handleChange("definition", val),
            true,
            "Provide a concise definition."
          )}

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

          <div className="space-y-3">
            <label className="block text-base font-medium text-gray-700 dark:text-gray-300">Type</label>
            <div className="relative">
              <select
                value={editedData.type}
                onChange={(e) => handleChange("type", e.target.value)}
                className="w-full px-4 py-3 text-base text-left rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 flex items-center justify-between shadow-sm"
              >
                <option value="">Select a type</option>
                {DATA_STRUCTURE_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {renderInput(
            "Characteristics",
            editedData.characteristics,
            (val) => handleChange("characteristics", val),
            true,
            "Describe key properties."
          )}
          {renderInput(
            "Visualization URL",
            editedData.visualization,
            (val) => handleChange("visualization", val),
            false,
            "URL to an image/GIF."
          )}

          <section className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
              Full Implementations
            </h2>
            {editedData.fullImplementations.map((impl, index) => (
              <div key={index} className="space-y-4 mb-6">
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    placeholder="Language (e.g., Python)"
                    value={impl.language}
                    onChange={(e) => updateArrayItem("fullImplementations", index, { ...impl, language: e.target.value.trim() })}
                    className={`flex-grow p-3 rounded-lg bg-white dark:bg-gray-900 border ${errors[`fullImpl-${index}-language`] ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors duration-200`}
                    id={`full-impl-${index}-lang`}
                  />
                  {editedData.fullImplementations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem("fullImplementations", index)}
                      className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
                {errors[`fullImpl-${index}-language`] && <p className="text-red-500 text-sm">Language is required</p>}
                <div className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
                  <MonacoEditor
                    height={calculateEditorHeight(impl.code)}
                    language={impl.language?.toLowerCase() || "javascript"}
                    value={impl.code}
                    onChange={(code) => updateArrayItem("fullImplementations", index, { ...impl, code })}
                    theme={themeMode === "dark" ? "vs-dark" : "vs-light"}
                    options={{ minimap: { enabled: false }, fontSize: 16, wordWrap: "on", automaticLayout: true, scrollBeyondLastLine: false, tabSize: 2 }}
                  />
                </div>
                {errors[`fullImpl-${index}-code`] && <p className="text-red-500 text-sm">Code is required</p>}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem("fullImplementations", { language: "", code: "" })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-base transition-colors duration-200"
            >
              <Plus size={18} /> Add Code
            </button>
          </section>

          <section className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
              Operations
            </h2>
            {editedData.operations.map((op, opIndex) => (
              <div key={opIndex} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Operation {opIndex + 1}: {op.name || "Untitled"}
                  </h4>
                  {editedData.operations.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem("operations", opIndex)}
                      className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
                {renderInput(
                  "Name",
                  op.name,
                  (val) => updateArrayItem("operations", opIndex, { ...op, name: val.trim() }),
                  false,
                  "e.g., Insert",
                  `op-${opIndex}-name`,
                  "text",
                  4,
                  true,
                  errors[`op-${opIndex}-name`]
                )}
                {renderInput(
                  "Description",
                  op.description,
                  (val) => updateArrayItem("operations", opIndex, { ...op, description: val.trim() }),
                  true,
                  "Explain the operation.",
                  `op-${opIndex}-description`,
                  "text",
                  4,
                  true,
                  errors[`op-${opIndex}-description`]
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {["time", "space"].map((key) => (
                    <div key={key}>
                      <label htmlFor={`op-${opIndex}-${key}`} className="block text-base font-medium text-gray-800 dark:text-gray-200 capitalize">
                        {key} Complexity <span className="text-red-500">*</span>
                      </label>
                      <input
                        id={`op-${opIndex}-${key}`}
                        type="text"
                        value={op.complexity[key]}
                        onChange={(e) => updateArrayItem("operations", opIndex, { ...op, complexity: { ...op.complexity, [key]: e.target.value.trim() } })}
                        placeholder="O(...)"
                        className={`w-full p-3 rounded-lg bg-white dark:bg-gray-900 border ${errors[`op-${opIndex}-${key}`] ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors duration-200`}
                      />
                      {errors[`op-${opIndex}-${key}`] && <p className="text-red-500 text-sm">{`${key} Complexity is required`}</p>}
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="text-base font-semibold text-gray-900 dark:text-gray-100">Code Examples</h5>
                    <button
                      type="button"
                      onClick={() => addNestedArrayItem("operations", opIndex, "implementations", { language: "", code: "", explanation: "", complexity: { time: "", space: "" } })}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-base transition-colors duration-200"
                    >
                      <Plus size={18} /> Add Code
                    </button>
                  </div>
                  {op.implementations.map((impl, implIndex) => (
                    <div key={implIndex} className="space-y-4 mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                      <div className="flex items-center gap-3">
                        <input
                          type="text"
                          placeholder="Language (e.g., C++)"
                          value={impl.language}
                          onChange={(e) => updateNestedArrayItem("operations", opIndex, "implementations", implIndex, { ...impl, language: e.target.value.trim() })}
                          className={`flex-grow p-3 rounded-lg bg-white dark:bg-gray-900 border ${errors[`op-${opIndex}-impl-${implIndex}-language`] ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors duration-200`}
                          id={`op-${opIndex}-impl-${implIndex}-lang`}
                        />
                        {op.implementations.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeNestedArrayItem("operations", opIndex, "implementations", implIndex)}
                            className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </div>
                      {errors[`op-${opIndex}-impl-${implIndex}-language`] && <p className="text-red-500 text-sm">Language is required</p>}
                      {renderInput(
                        "Explanation",
                        impl.explanation,
                        (val) => updateNestedArrayItem("operations", opIndex, "implementations", implIndex, { ...impl, explanation: val.trim() }),
                        true,
                        "Explain the code.",
                        `op-${opIndex}-impl-${implIndex}-explanation`,
                        "text",
                        3,
                        true,
                        errors[`op-${opIndex}-impl-${implIndex}-explanation`]
                      )}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {["time", "space"].map((key) => (
                          <div key={key}>
                            <label htmlFor={`op-${opIndex}-impl-${implIndex}-${key}`} className="block text-base font-medium text-gray-800 dark:text-gray-200 capitalize">
                              {key} Complexity <span className="text-red-500">*</span>
                            </label>
                            <input
                              id={`op-${opIndex}-impl-${implIndex}-${key}`}
                              type="text"
                              value={impl.complexity[key]}
                              onChange={(e) => updateNestedArrayItem("operations", opIndex, "implementations", implIndex, { ...impl, complexity: { ...impl.complexity, [key]: e.target.value.trim() } })}
                              placeholder="O(...)"
                              className={`w-full p-3 rounded-lg bg-white dark:bg-gray-900 border ${errors[`op-${opIndex}-impl-${implIndex}-${key}`] ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors duration-200`}
                            />
                            {errors[`op-${opIndex}-impl-${implIndex}-${key}`] && <p className="text-red-500 text-sm">{`${key} Complexity is required`}</p>}
                          </div>
                        ))}
                      </div>
                      <div className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700">
                        <MonacoEditor
                          height={calculateEditorHeight(impl.code)}
                          language={impl.language?.toLowerCase() || "javascript"}
                          value={impl.code}
                          onChange={(code) => updateNestedArrayItem("operations", opIndex, "implementations", implIndex, { ...impl, code })}
                          theme={themeMode === "dark" ? "vs-dark" : "vs-light"}
                          options={{ minimap: { enabled: false }, fontSize: 16, wordWrap: "on", automaticLayout: true, scrollBeyondLastLine: false, tabSize: 2 }}
                        />
                      </div>
                      {errors[`op-${opIndex}-impl-${implIndex}-code`] && <p className="text-red-500 text-sm">Code is required</p>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem("operations", { name: "", description: "", complexity: { time: "", space: "" }, implementations: [{ language: "", code: "", explanation: "", complexity: { time: "", space: "" } }] })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-base transition-colors duration-200"
            >
              <Plus size={18} /> Add Operation
            </button>
          </section>

          <section className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
              Applications
            </h2>
            {editedData.applications.map((app, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Application {index + 1}: {app.domain || "Untitled"}
                  </h4>
                  {editedData.applications.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem("applications", index)}
                      className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
                {renderInput(
                  "Domain",
                  app.domain,
                  (val) => updateArrayItem("applications", index, { ...app, domain: val.trim() }),
                  false,
                  "e.g., Databases",
                  `app-${index}-domain`,
                  "text",
                  4,
                  true,
                  errors[`app-${index}-domain`]
                )}
                <div className="mt-4">
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="text-base font-semibold text-gray-900 dark:text-gray-100">Examples</h5>
                    <button
                      type="button"
                      onClick={() => addNestedArrayItem("applications", index, "examples", "")}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-base transition-colors duration-200"
                    >
                      <Plus size={18} /> Add Example
                    </button>
                  </div>
                  {app.examples.map((example, exIndex) => (
                    <div key={exIndex} className="flex items-center gap-3 mt-2">
                      <input
                        type="text"
                        value={example}
                        onChange={(e) => updateNestedArrayItem("applications", index, "examples", exIndex, e.target.value.trim())}
                        placeholder="e.g., Autocomplete"
                        className={`flex-grow p-3 rounded-lg bg-white dark:bg-gray-900 border ${errors[`app-${index}-examples`] ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors duration-200`}
                        id={`app-${index}-ex-${exIndex}`}
                      />
                      {app.examples.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeNestedArrayItem("applications", index, "examples", exIndex)}
                          className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                        >
                          <XCircle size={20} />
                        </button>
                      )}
                    </div>
                  ))}
                  {errors[`app-${index}-examples`] && <p className="text-red-500 text-sm">At least one non-empty example is required</p>}
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem("applications", { domain: "", examples: [""] })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-base transition-colors duration-200"
            >
              <Plus size={18} /> Add Application
            </button>
          </section>

          <section className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
              Comparisons
            </h2>
            {editedData.comparisons.map((comp, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Comparison {index + 1}: {comp.with || "Untitled"}
                  </h4>
                  {editedData.comparisons.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeArrayItem("comparisons", index)}
                      className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                    >
                      <Trash2 size={20} />
                    </button>
                  )}
                </div>
                {renderInput(
                  "Compare With",
                  comp.with,
                  (val) => updateArrayItem("comparisons", index, { ...comp, with: val.trim() }),
                  false,
                  "e.g., Hash Table",
                  `comp-${index}-with`,
                  "text",
                  4,
                  true,
                  errors[`comp-${index}-with`]
                )}
                {["advantages", "disadvantages"].map((field) => (
                  <div key={field} className="mt-4">
                    <div className="flex justify-between items-center mb-3">
                      <h5 className="text-base font-semibold text-gray-900 dark:text-gray-100 capitalize">{field}</h5>
                      <button
                        type="button"
                        onClick={() => addNestedArrayItem("comparisons", index, field, "")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-base transition-colors duration-200"
                      >
                        <Plus size={18} /> Add {field.slice(0, -1)}
                      </button>
                    </div>
                    {comp[field].map((item, itemIndex) => (
                      <div key={itemIndex} className="flex items-center gap-3 mt-2">
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => updateNestedArrayItem("comparisons", index, field, itemIndex, e.target.value.trim())}
                          placeholder={field === "advantages" ? "Advantage" : "Disadvantage"}
                          className={`flex-grow p-3 rounded-lg bg-white dark:bg-gray-900 border ${errors[`comp-${index}-${field}`] ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors duration-200`}
                          id={`comp-${index}-${field}-${itemIndex}`}
                        />
                        {comp[field].length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeNestedArrayItem("comparisons", index, field, itemIndex)}
                            className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                          >
                            <XCircle size={20} />
                          </button>
                        )}
                      </div>
                    ))}
                    {errors[`comp-${index}-${field}`] && <p className="text-red-500 text-sm">{`At least one non-empty ${field.slice(0, -1)} is required`}</p>}
                  </div>
                ))}
                {renderInput(
                  "When To Use",
                  comp.whenToUse,
                  (val) => updateArrayItem("comparisons", index, { ...comp, whenToUse: val.trim() }),
                  true,
                  "When to prefer this structure.",
                  `comp-${index}-whenToUse`,
                  "text",
                  3,
                  true,
                  errors[`comp-${index}-whenToUse`]
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem("comparisons", { with: "", advantages: [""], disadvantages: [""], whenToUse: "" })}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-base transition-colors duration-200"
            >
              <Plus size={18} /> Add Comparison
            </button>
          </section>

          <section className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
              Metadata
            </h2>
            <div className="grid grid-cols-1 gap-6">
              {["tags", "references", "videoLinks"].map((field) => (
                <div key={field}>
                  <div className="flex justify-between items-center mb-3">
                    <h5 className="text-base font-semibold text-gray-900 dark:text-gray-100 capitalize">
                      {field.replace(/([A-Z])/g, " $1").trim()}
                    </h5>
                    <button
                      type="button"
                      onClick={() => addArrayItem(field, "")}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-base transition-colors duration-200"
                    >
                      <Plus size={18} /> Add {field.replace(/([A-Z])/g, " $1").trim().slice(0, -1)}
                    </button>
                  </div>
                  {editedData[field].map((item, index) => (
                    <div key={index} className="flex items-center gap-3 mt-2">
                      <input
                        type={field === "tags" ? "text" : "url"}
                        value={item}
                        onChange={(e) => updateArrayItem(field, index, e.target.value.trim())}
                        placeholder={field === "tags" ? "e.g., trie" : field === "references" ? "https://example.com" : "https://youtube.com/..."}
                        className="flex-grow p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors duration-200"
                        id={`${field}-${index}`}
                      />
                      <button
                        type="button"
                        onClick={() => removeArrayItem(field, index)}
                        className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                      >
                        <XCircle size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </section>

        </div>
      ) : (
        <div className="p-6 bg-gray-50 dark:bg-gray-800/50 rounded-2xl">
          <DataStructurePreview dataStructure={editedData} />
        </div>
      )}
    </div>
  );
};

export default DataStructureProposalForm;