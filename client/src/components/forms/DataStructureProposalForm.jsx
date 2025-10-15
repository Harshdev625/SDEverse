import { useState, useEffect } from "react";
import MonacoEditor from "@monaco-editor/react";
import { Plus, Trash2, XCircle } from "lucide-react";
import DataStructurePreview from "../../pages/DataStructurePreview";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";

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

const DataStructureProposalForm = ({ initialData = {}, dsCategories = [], dataStructures = [], onChange, onSubmit }) => {
  const themeMode = useSelector((state) => state.theme.mode);
  const [isEditing, setIsEditing] = useState(true);
  const [formData, setFormData] = useState({
    title: initialData.title || "",
    definition: initialData.definition || "",
    category: initialData.category || [],
    type: initialData.type || "",
    characteristics: initialData.characteristics || "",
    visualization: initialData.visualization || "",
    operations: initialData.operations?.length > 0 ? initialData.operations : [
      { name: "", description: "", complexity: { time: "", space: "" }, implementations: [{ language: "", code: "", explanation: "", complexity: { time: "", space: "" } }] }
    ],
    fullImplementations: initialData.fullImplementations?.length > 0 ? initialData.fullImplementations : [{ language: "", code: "" }],
    applications: initialData.applications?.length > 0 ? initialData.applications : [{ domain: "", examples: [""] }],
    comparisons: initialData.comparisons?.length > 0 ? initialData.comparisons : [{ with: "", advantages: [""], disadvantages: [""], whenToUse: "" }],
    tags: initialData.tags || [],
    references: initialData.references || [],
    videoLinks: initialData.videoLinks || [],
    targetDataStructure: initialData.targetDataStructure || null,
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    onChange(formData);
  }, [formData, onChange]);

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = true;
    if (!formData.definition.trim()) newErrors.definition = true;
    if (!formData.type) newErrors.type = true;
    if (!formData.characteristics.trim()) newErrors.characteristics = true;
    if (!formData.category.length) newErrors.category = true;
    formData.category.forEach((cat) => {
      if (!dsCategories.includes(cat)) newErrors[`cat-${cat}`] = true;
    });

    formData.operations.forEach((op, i) => {
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

    formData.fullImplementations.forEach((impl, i) => {
      if (!impl.language.trim()) newErrors[`fullImpl-${i}-language`] = true;
      if (!impl.code.trim()) newErrors[`fullImpl-${i}-code`] = true;
    });

    formData.applications.forEach((app, i) => {
      if (!app.domain.trim()) newErrors[`app-${i}-domain`] = true;
      if (!app.examples.some((ex) => ex.trim())) newErrors[`app-${i}-examples`] = true;
    });

    formData.comparisons.forEach((comp, i) => {
      if (!comp.with.trim()) newErrors[`comp-${i}-with`] = true;
      if (!comp.whenToUse.trim()) newErrors[`comp-${i}-whenToUse`] = true;
      if (!comp.advantages.some((adv) => adv.trim())) newErrors[`comp-${i}-advantages`] = true;
      if (!comp.disadvantages.some((dis) => dis.trim())) newErrors[`comp-${i}-disadvantages`] = true;
    });

    setErrors(newErrors);
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { isValid, errors } = validate();
    if (!isValid) {
      const errorMessages = [];
      if (errors.title) errorMessages.push("Title");
      if (errors.definition) errorMessages.push("Definition");
      if (errors.type) errorMessages.push("Type");
      if (errors.characteristics) errorMessages.push("Characteristics");
      if (errors.category) errorMessages.push("Category");
      Object.keys(errors).forEach((key) => {
        if (key.startsWith("cat-")) errorMessages.push("Invalid Category");
        if (key.startsWith("op-")) {
          if (key.includes("-name")) errorMessages.push("Operation Name");
          if (key.includes("-description")) errorMessages.push("Operation Description");
          if (key.includes("-time")) errorMessages.push("Operation Time Complexity");
          if (key.includes("-space")) errorMessages.push("Operation Space Complexity");
          if (key.includes("-impl-") && key.includes("-language")) errorMessages.push("Operation Implementation Language");
          if (key.includes("-impl-") && key.includes("-code")) errorMessages.push("Operation Implementation Code");
          if (key.includes("-impl-") && key.includes("-explanation")) errorMessages.push("Operation Implementation Explanation");
          if (key.includes("-impl-") && key.includes("-time")) errorMessages.push("Operation Implementation Time Complexity");
          if (key.includes("-impl-") && key.includes("-space")) errorMessages.push("Operation Implementation Space Complexity");
        }
        if (key.startsWith("fullImpl-")) {
          if (key.includes("-language")) errorMessages.push("Full Implementation Language");
          if (key.includes("-code")) errorMessages.push("Full Implementation Code");
        }
        if (key.startsWith("app-")) {
          if (key.includes("-domain")) errorMessages.push("Application Domain");
          if (key.includes("-examples")) errorMessages.push("Application Examples");
        }
        if (key.startsWith("comp-")) {
          if (key.includes("-with")) errorMessages.push("Comparison With");
          if (key.includes("-whenToUse")) errorMessages.push("Comparison When To Use");
          if (key.includes("-advantages")) errorMessages.push("Comparison Advantages");
          if (key.includes("-disadvantages")) errorMessages.push("Comparison Disadvantages");
        }
      });
      const uniqueErrors = [...new Set(errorMessages)];
      toast.error(`Missing or invalid fields: ${uniqueErrors.join(", ")}`);
      return;
    }
    onSubmit(formData);
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: false }));
  };

  const addArrayItem = (field, newItem) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], newItem],
    }));
  };

  const removeArrayItem = (field, index) => {
    if (["operations", "fullImplementations", "applications", "comparisons"].includes(field) && formData[field].length === 1) {
      toast.warn(`At least one ${field.slice(0, -1)} is required.`);
      return;
    }
    setFormData((prev) => ({
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
    setFormData((prev) => ({
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
    setFormData((prev) => {
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
    setFormData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = {
        ...newArray[index],
        [nestedField]: [...newArray[index][nestedField], newItem],
      };
      return { ...prev, [field]: newArray };
    });
  };

  const removeNestedArrayItem = (field, index, nestedField, nestedIndex) => {
    if (["implementations", "examples", "advantages", "disadvantages"].includes(nestedField) && formData[field][index][nestedField].length === 1) {
      toast.warn(`At least one ${nestedField.slice(0, -1)} is required.`);
      return;
    }
    setFormData((prev) => {
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
    setFormData((prev) => {
      const currentArray = prev[field] || [];
      const newArray = isChecked ? [...new Set([...currentArray, value])] : currentArray.filter((item) => item !== value);
      return { ...prev, [field]: newArray };
    });
    if (field === "category") setErrors((prev) => ({ ...prev, category: false, [`cat-${value}`]: false }));
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8 text-gray-900 dark:text-gray-100">
      <div className="flex justify-center mb-6">
        <div className="inline-flex rounded-full bg-gray-100 dark:bg-gray-800 p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className={`px-6 py-2 rounded-full text-base font-medium transition-all duration-200 ${
              isEditing ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => setIsEditing(false)}
            className={`px-6 py-2 rounded-full text-base font-medium transition-all duration-200 ${
              !isEditing ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Preview
          </button>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-8">
          <section className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
              Basic Information
            </h2>
            <div className="space-y-6">
              {renderInput(
                "Title",
                formData.title,
                (val) => handleChange("title", val),
                false,
                "e.g., Trie",
                "ds-title",
                "text",
                4,
                true,
                errors.title
              )}
              {renderInput(
                "Definition",
                formData.definition,
                (val) => handleChange("definition", val),
                true,
                "Provide a concise definition.",
                "ds-definition",
                "text",
                4,
                true,
                errors.definition
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="ds-target" className="block text-base font-medium text-gray-800 dark:text-gray-200">
                     Data Structure
                  </label>
                  <select
                    id="ds-target"
                    value={formData.targetDataStructure || ""}
                    onChange={(e) => handleChange("targetDataStructure", e.target.value || null)}
                    className="w-full p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors duration-200"
                  >
                    <option value="">None</option>
                    {dataStructures.map((ds) => (
                      <option key={ds._id} value={ds._id}>
                        {ds.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="ds-category" className="block text-base font-medium text-gray-800 dark:text-gray-200">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700">
                    {dsCategories.map((cat) => (
                      <label key={cat} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`cat-${cat}`}
                          value={cat}
                          checked={formData.category.includes(cat)}
                          onChange={(e) => handleMultiSelectChange("category", cat, e.target.checked)}
                          className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-base">{cat}</span>
                        {errors[`cat-${cat}`] && <span className="text-red-500 text-sm">Invalid</span>}
                      </label>
                    ))}
                  </div>
                  {errors.category && <p className="text-red-500 text-sm">At least one valid category is required</p>}
                </div>
                <div>
                  <label htmlFor="ds-type" className="block text-base font-medium text-gray-800 dark:text-gray-200">
                    Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="ds-type"
                    value={formData.type}
                    onChange={(e) => handleChange("type", e.target.value)}
                    className={`w-full p-3 rounded-lg bg-white dark:bg-gray-900 border ${errors.type ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors duration-200`}
                  >
                    <option value="">Select a type</option>
                    {DATA_STRUCTURE_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  {errors.type && <p className="text-red-500 text-sm">Type is required</p>}
                </div>
              </div>
              {renderInput(
                "Characteristics",
                formData.characteristics,
                (val) => handleChange("characteristics", val),
                true,
                "Describe key properties.",
                "ds-characteristics",
                "text",
                4,
                true,
                errors.characteristics
              )}
              {renderInput(
                "Visualization URL",
                formData.visualization,
                (val) => handleChange("visualization", val),
                false,
                "URL to an image/GIF.",
                "ds-visualization",
                "url"
              )}
            </div>
          </section>

          <section className="p-6 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4 border-b border-gray-200 dark:border-gray-700 pb-3">
              Full Implementations
            </h2>
            {formData.fullImplementations.map((impl, index) => (
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
                  {formData.fullImplementations.length > 1 && (
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
            {formData.operations.map((op, opIndex) => (
              <div key={opIndex} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Operation {opIndex + 1}: {op.name || "Untitled"}
                  </h4>
                  {formData.operations.length > 1 && (
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
            {formData.applications.map((app, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Application {index + 1}: {app.domain || "Untitled"}
                  </h4>
                  {formData.applications.length > 1 && (
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
            {formData.comparisons.map((comp, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg mb-6 border border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Comparison {index + 1}: {comp.with || "Untitled"}
                  </h4>
                  {formData.comparisons.length > 1 && (
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
                  {formData[field].map((item, index) => (
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

          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-base font-medium transition-colors duration-200"
            >
              Submit
            </button>
          </div>
        </form>
      ) : (
        <DataStructurePreview dataStructure={formData} />
      )}
    </div>
  );
};

export default DataStructureProposalForm;