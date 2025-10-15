import { useState, useEffect } from "react";
import { Trash2, Plus, ChevronDown } from "lucide-react";
import MonacoEditor from "@monaco-editor/react";
import { useDispatch, useSelector } from "react-redux";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import DataStructurePreview from "../../pages/DataStructurePreview";
import { fetchDataStructureCategories, updateExistingDataStructure } from "../../features/dataStructure/dataStructureSlice";

const DATA_STRUCTURE_TYPES = ["Linear", "Non-Linear", "Hierarchical", "Graph", "Other"];

const EditDataStructureForm = ({ dataStructure = {}, dataStructures = [], onSave, onCancel }) => {
  const dispatch = useDispatch();
  const themeMode = useSelector((state) => state.theme.mode);
  const { categories, loading: categoriesLoading, error } = useSelector((state) => state.dataStructure || {});

  const [editedData, setEditedData] = useState({
    title: dataStructure.title || "",
    definition: dataStructure.definition || "",
    characteristics: dataStructure.characteristics || "",
    visualization: dataStructure.visualization || "",
    category: Array.isArray(dataStructure.category) ? dataStructure.category : [],
    type: dataStructure.type || "",
    targetDataStructure: dataStructure.targetDataStructure || null,
    operations: Array.isArray(dataStructure.operations) && dataStructure.operations.length > 0
      ? dataStructure.operations
      : [{ name: "", description: "", complexity: { time: "", space: "" }, implementations: [{ language: "", code: "", explanation: "", complexity: { time: "", space: "" } }] }],
    fullImplementations: Array.isArray(dataStructure.fullImplementations) && dataStructure.fullImplementations.length > 0
      ? dataStructure.fullImplementations
      : [{ language: "", code: "" }],
    applications: Array.isArray(dataStructure.applications) && dataStructure.applications.length > 0
      ? dataStructure.applications
      : [{ domain: "", examples: [""] }],
    comparisons: Array.isArray(dataStructure.comparisons) && dataStructure.comparisons.length > 0
      ? dataStructure.comparisons
      : [{ with: "", advantages: [""], disadvantages: [""], whenToUse: "" }],
    tags: Array.isArray(dataStructure.tags) ? dataStructure.tags : [],
    references: Array.isArray(dataStructure.references) ? dataStructure.references : [],
    videoLinks: Array.isArray(dataStructure.videoLinks) ? dataStructure.videoLinks : [],
    upvotes: dataStructure.upvotes || 0,
    downvotes: dataStructure.downvotes || 0,
    views: dataStructure.views || 0,
    contributors: Array.isArray(dataStructure.contributors) ? dataStructure.contributors : [],
  });
  const [preview, setPreview] = useState(false);
  const [selectedCodeIndex, setSelectedCodeIndex] = useState(0);
  const [selectedOperationIndex, setSelectedOperationIndex] = useState(0);
  const [selectedImplIndex, setSelectedImplIndex] = useState(0);
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!categories?.length && !categoriesLoading) {
      dispatch(fetchDataStructureCategories());
    }
  }, [dispatch, categories, categoriesLoading]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

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

  const updateArrayItem = (field, index, value) => {
    const updated = [...editedData[field]];
    updated[index] = value;
    handleChange(field, updated);
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith(`${field}-${index}`)) delete newErrors[key];
      });
      return newErrors;
    });
  };

  const addArrayItem = (field, defaultValue) => {
    const updated = [...editedData[field], defaultValue];
    handleChange(field, updated);
    if (field === "fullImplementations") setSelectedCodeIndex(updated.length - 1);
    if (field === "operations") setSelectedOperationIndex(updated.length - 1);
  };

  const removeArrayItem = (field, index) => {
    if (["operations", "fullImplementations", "applications", "comparisons"].includes(field) && editedData[field].length === 1) {
      toast.warn(`At least one ${field.slice(0, -1)} is required.`);
      return;
    }
    const updated = editedData[field].filter((_, i) => i !== index);
    handleChange(field, updated);
    if (field === "fullImplementations" && index <= selectedCodeIndex) {
      setSelectedCodeIndex(Math.max(Math.min(selectedCodeIndex, updated.length - 1), 0));
    }
    if (field === "operations" && index <= selectedOperationIndex) {
      setSelectedOperationIndex(Math.max(Math.min(selectedOperationIndex, updated.length - 1), 0));
    }
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith(`${field}-${index}`)) delete newErrors[key];
      });
      return newErrors;
    });
  };

  const handleOperationChange = (opIndex, field, value) => {
    const updated = [...editedData.operations];
    updated[opIndex] = { ...updated[opIndex], [field]: value };
    handleChange("operations", updated);
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith(`op-${opIndex}-${field}`)) delete newErrors[key];
      });
      return newErrors;
    });
  };

  const handleImplementationChange = (opIndex, implIndex, field, value) => {
    const updated = [...editedData.operations];
    updated[opIndex].implementations[implIndex] = {
      ...updated[opIndex].implementations[implIndex],
      [field]: value,
    };
    handleChange("operations", updated);
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.startsWith(`op-${opIndex}-impl-${implIndex}-${field}`)) delete newErrors[key];
      });
      return newErrors;
    });
  };

  const addNestedArrayItem = (field, index, nestedField, value) => {
    const updated = [...editedData[field]];
    updated[index] = {
      ...updated[index],
      [nestedField]: [...updated[index][nestedField], value],
    };
    handleChange(field, updated);
    if (field === "operations" && nestedField === "implementations") {
      setSelectedImplIndex(updated[index].implementations.length - 1);
    }
  };

  const removeNestedArrayItem = (field, index, nestedField, nestedIndex) => {
    if (["implementations", "examples", "advantages", "disadvantages"].includes(nestedField) && editedData[field][index][nestedField].length === 1) {
      toast.warn(`At least one ${nestedField.slice(0, -1)} is required.`);
      return;
    }
    const updated = [...editedData[field]];
    updated[index] = {
      ...updated[index],
      [nestedField]: updated[index][nestedField].filter((_, i) => i !== nestedIndex),
    };
    handleChange(field, updated);
    if (field === "operations" && nestedField === "implementations" && nestedIndex <= selectedImplIndex) {
      setSelectedImplIndex(Math.max(Math.min(selectedImplIndex, updated[index].implementations.length - 1), 0));
    }
    setErrors((prev) => {
      const newErrors = { ...prev };
      Object.keys(newErrors).forEach((key) => {
        if (key.includes(`${field}-${index}-${nestedField}-${nestedIndex}`)) delete newErrors[key];
      });
      return newErrors;
    });
  };

  const calculateEditorHeight = (code) => {
    const lines = code ? code.split("\n").length : 12;
    return Math.max(300, Math.min(800, lines * 24));
  };

  const handleSave = async () => {
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

    try {
      const formattedData = {
        title: editedData.title.trim(),
        definition: editedData.definition.trim(),
        characteristics: editedData.characteristics.trim(),
        visualization: editedData.visualization.trim(),
        category: editedData.category,
        type: editedData.type,
        targetDataStructure: editedData.targetDataStructure || null,
        operations: editedData.operations.map((op) => ({
          ...op,
          name: op.name.trim(),
          description: op.description.trim(),
          complexity: {
            time: op.complexity.time.trim(),
            space: op.complexity.space.trim(),
          },
          implementations: op.implementations.map((impl) => ({
            ...impl,
            language: impl.language.trim(),
            code: impl.code.trim(),
            explanation: impl.explanation.trim(),
            complexity: {
              time: impl.complexity.time.trim(),
              space: impl.complexity.space.trim(),
            },
          })),
        })),
        fullImplementations: editedData.fullImplementations.map((impl) => ({
          ...impl,
          language: impl.language.trim(),
          code: impl.code.trim(),
        })),
        applications: editedData.applications.map((app) => ({
          ...app,
          domain: app.domain.trim(),
          examples: app.examples.map((ex) => ex.trim()).filter(Boolean),
        })),
        comparisons: editedData.comparisons.map((comp) => ({
          ...comp,
          with: comp.with.trim(),
          advantages: comp.advantages.map((adv) => adv.trim()).filter(Boolean),
          disadvantages: comp.disadvantages.map((dis) => dis.trim()).filter(Boolean),
          whenToUse: comp.whenToUse.trim(),
        })),
        tags: editedData.tags.map((tag) => tag.trim()).filter(Boolean),
        references: editedData.references.map((ref) => ref.trim()).filter(Boolean),
        videoLinks: editedData.videoLinks.map((link) => link.trim()).filter(Boolean),
      };
      await dispatch(
        updateExistingDataStructure({ slug: dataStructure.slug, dataStructureData: formattedData })
      ).unwrap();
      toast.success("Data structure updated successfully!");
      onSave(formattedData);
    } catch (err) {
      toast.error(err.message || "Failed to update data structure");
    }
  };

  const renderInput = (label, value, onChange, multiline = false, required = false, error = false, type = "text", placeholder = "") => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-2"
    >
      <label className="block text-base font-medium text-gray-800 dark:text-gray-200">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {multiline ? (
        <textarea
          className={`w-full p-3 rounded-lg bg-white dark:bg-gray-900 border ${error ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors duration-200`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value.trim())}
          rows={5}
          required={required}
          placeholder={placeholder}
        />
      ) : (
        <input
          type={type}
          className={`w-full p-3 rounded-lg bg-white dark:bg-gray-900 border ${error ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors duration-200`}
          value={value || ""}
          onChange={(e) => onChange(e.target.value.trim())}
          required={required}
          placeholder={placeholder}
        />
      )}
      {error && <p className="text-red-500 text-sm">{`${label} is required`}</p>}
    </motion.div>
  );

  const renderDropdown = (label, options, selected, setSelected, isOpen, setOpen, required = false, error = false) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="space-y-2"
    >
      <label className="block text-base font-medium text-gray-800 dark:text-gray-200">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setOpen(!isOpen)}
          className={`w-full p-3 rounded-lg bg-white dark:bg-gray-900 border ${error ? "border-red-500" : "border-gray-300 dark:border-gray-700"} text-base text-left flex items-center justify-between focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200`}
        >
          <span>{selected || `Select ${label.toLowerCase()}`}</span>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={20} />
          </motion.div>
        </motion.button>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 max-h-60 overflow-auto"
          >
            {options.map((opt) => (
              <motion.button
                key={opt}
                whileHover={{ backgroundColor: "#e5e7eb" }}
                onClick={() => {
                  setSelected(opt);
                  setOpen(false);
                }}
                className={`w-full px-4 py-2 text-base text-left transition-colors duration-200 ${selected === opt ? "bg-blue-100 dark:bg-blue-900/30 font-medium" : "hover:bg-gray-100 dark:hover:bg-gray-800"}`}
              >
                {opt}
              </motion.button>
            ))}
          </motion.div>
        )}
      </div>
      {error && <p className="text-red-500 text-sm">{`${label} is required`}</p>}
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8"
    >
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700">
        <div className="flex justify-center p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="inline-flex rounded-full bg-gray-100 dark:bg-gray-800 p-1 shadow-sm">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPreview(false)}
              className={`px-6 py-2 rounded-full text-base font-medium transition-all duration-200 ${!preview ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
            >
              Edit
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setPreview(true)}
              className={`px-6 py-2 rounded-full text-base font-medium transition-all duration-200 ${preview ? "bg-blue-600 text-white" : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
            >
              Preview
            </motion.button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {preview ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50 dark:bg-gray-950 rounded-lg p-4"
            >
              <DataStructurePreview dataStructure={editedData} />
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-3">
                  Basic Information
                </h2>
                {renderInput(
                  "Title",
                  editedData.title,
                  (val) => handleChange("title", val),
                  false,
                  true,
                  errors.title,
                  "text",
                  "e.g., Trie"
                )}
                {renderInput(
                  "Definition",
                  editedData.definition,
                  (val) => handleChange("definition", val),
                  true,
                  true,
                  errors.definition,
                  "text",
                  "Provide a concise definition."
                )}
                {renderInput(
                  "Characteristics",
                  editedData.characteristics,
                  (val) => handleChange("characteristics", val),
                  true,
                  true,
                  errors.characteristics,
                  "text",
                  "Describe key properties."
                )}
                {renderInput(
                  "Visualization URL",
                  editedData.visualization,
                  (val) => handleChange("visualization", val),
                  false,
                  false,
                  false,
                  "url",
                  "URL to an image/GIF."
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-base font-medium text-gray-800 dark:text-gray-200">
                      Target Data Structure
                    </label>
                    <select
                      value={editedData.targetDataStructure || ""}
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
                  {renderDropdown(
                    "Type",
                    DATA_STRUCTURE_TYPES,
                    editedData.type,
                    (val) => handleChange("type", val),
                    showTypeDropdown,
                    setShowTypeDropdown,
                    true,
                    errors.type
                  )}
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-2"
                >
                  <label className="block text-base font-medium text-gray-800 dark:text-gray-200">
                    Categories <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700">
                    {categories?.map((cat) => (
                      <motion.label
                        key={cat}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center space-x-2"
                      >
                        <input
                          type="checkbox"
                          value={cat}
                          checked={editedData.category.includes(cat)}
                          onChange={(e) => {
                            const updated = e.target.checked
                              ? [...editedData.category, cat]
                              : editedData.category.filter((c) => c !== cat);
                            handleChange("category", updated);
                            setErrors((prev) => ({ ...prev, category: false, [`cat-${cat}`]: false }));
                          }}
                          className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <span className="text-base">{cat}</span>
                        {errors[`cat-${cat}`] && <span className="text-red-500 text-sm">Invalid</span>}
                      </motion.label>
                    ))}
                  </div>
                  {errors.category && <p className="text-red-500 text-sm">At least one valid category is required</p>}
                </motion.div>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-3">
                  Operations
                </h2>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Operations <span className="text-red-500">*</span>
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      addArrayItem("operations", {
                        name: "",
                        description: "",
                        complexity: { time: "", space: "" },
                        implementations: [{ language: "", code: "", explanation: "", complexity: { time: "", space: "" } }],
                      })
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-base transition-colors duration-200"
                  >
                    <Plus size={18} /> Add Operation
                  </motion.button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editedData.operations.map((op, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedOperationIndex(index)}
                      className={`px-4 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${selectedOperationIndex === index ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                    >
                      {op.name || `Operation ${index + 1}`}
                    </motion.button>
                  ))}
                </div>
                {editedData.operations[selectedOperationIndex] && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4"
                  >
                    {renderInput(
                      "Operation Name",
                      editedData.operations[selectedOperationIndex].name,
                      (val) => handleOperationChange(selectedOperationIndex, "name", val),
                      false,
                      true,
                      errors[`op-${selectedOperationIndex}-name`],
                      "text",
                      "e.g., Insert"
                    )}
                    {renderInput(
                      "Description",
                      editedData.operations[selectedOperationIndex].description,
                      (val) => handleOperationChange(selectedOperationIndex, "description", val),
                      true,
                      true,
                      errors[`op-${selectedOperationIndex}-description`],
                      "text",
                      "Explain the operation."
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {["time", "space"].map((key) => (
                        <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-2">
                          <label className="block text-base font-medium text-gray-800 dark:text-gray-200 capitalize">
                            {key} Complexity <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            className={`w-full p-3 rounded-lg bg-white dark:bg-gray-900 border ${errors[`op-${selectedOperationIndex}-${key}`] ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors duration-200`}
                            value={editedData.operations[selectedOperationIndex].complexity[key] || ""}
                            onChange={(e) =>
                              handleOperationChange(selectedOperationIndex, "complexity", {
                                ...editedData.operations[selectedOperationIndex].complexity,
                                [key]: e.target.value.trim(),
                              })
                            }
                            placeholder="O(...)"
                          />
                          {errors[`op-${selectedOperationIndex}-${key}`] && <p className="text-red-500 text-sm">{`${key} Complexity is required`}</p>}
                        </motion.div>
                      ))}
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                          Implementations <span className="text-red-500">*</span>
                        </h4>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() =>
                            addNestedArrayItem("operations", selectedOperationIndex, "implementations", {
                              language: "",
                              code: "",
                              explanation: "",
                              complexity: { time: "", space: "" },
                            })
                          }
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-base transition-colors duration-200"
                        >
                          <Plus size={18} /> Add Implementation
                        </motion.button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {editedData.operations[selectedOperationIndex].implementations.map((impl, index) => (
                          <motion.button
                            key={index}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSelectedImplIndex(index)}
                            className={`px-4 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${selectedImplIndex === index ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                          >
                            {impl.language || `Impl ${index + 1}`}
                          </motion.button>
                        ))}
                      </div>
                      {editedData.operations[selectedOperationIndex].implementations[selectedImplIndex] && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          className="space-y-4"
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="text"
                              placeholder="Language (e.g., JavaScript)"
                              value={editedData.operations[selectedOperationIndex].implementations[selectedImplIndex].language || ""}
                              onChange={(e) => handleImplementationChange(selectedOperationIndex, selectedImplIndex, "language", e.target.value.trim())}
                              className={`flex-grow p-3 rounded-lg bg-white dark:bg-gray-900 border ${errors[`op-${selectedOperationIndex}-impl-${selectedImplIndex}-language`] ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors duration-200`}
                            />
                            {editedData.operations[selectedOperationIndex].implementations.length > 1 && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => removeNestedArrayItem("operations", selectedOperationIndex, "implementations", selectedImplIndex)}
                                className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                              >
                                <Trash2 size={20} />
                              </motion.button>
                            )}
                          </div>
                          {errors[`op-${selectedOperationIndex}-impl-${selectedImplIndex}-language`] && <p className="text-red-500 text-sm">Language is required</p>}
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700"
                          >
                            <MonacoEditor
                              height={calculateEditorHeight(editedData.operations[selectedOperationIndex].implementations[selectedImplIndex].code || "")}
                              language={editedData.operations[selectedOperationIndex].implementations[selectedImplIndex].language.toLowerCase() || "javascript"}
                              value={editedData.operations[selectedOperationIndex].implementations[selectedImplIndex].code || ""}
                              onChange={(code) => handleImplementationChange(selectedOperationIndex, selectedImplIndex, "code", code)}
                              theme={themeMode === "dark" ? "vs-dark" : "vs-light"}
                              options={{
                                minimap: { enabled: false },
                                fontSize: 16,
                                wordWrap: "on",
                                automaticLayout: true,
                                scrollBeyondLastLine: false,
                                roundedSelection: true,
                                padding: { top: 10, bottom: 10 },
                                tabSize: 2,
                              }}
                            />
                          </motion.div>
                          {errors[`op-${selectedOperationIndex}-impl-${selectedImplIndex}-code`] && <p className="text-red-500 text-sm">Code is required</p>}
                          {renderInput(
                            "Implementation Explanation",
                            editedData.operations[selectedOperationIndex].implementations[selectedImplIndex].explanation,
                            (val) => handleImplementationChange(selectedOperationIndex, selectedImplIndex, "explanation", val),
                            true,
                            true,
                            errors[`op-${selectedOperationIndex}-impl-${selectedImplIndex}-explanation`],
                            "text",
                            "Explain the code."
                          )}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {["time", "space"].map((key) => (
                              <motion.div key={key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-2">
                                <label className="block text-base font-medium text-gray-800 dark:text-gray-200 capitalize">
                                  {key} Complexity <span className="text-red-500">*</span>
                                </label>
                                <input
                                  type="text"
                                  className={`w-full p-3 rounded-lg bg-white dark:bg-gray-900 border ${errors[`op-${selectedOperationIndex}-impl-${selectedImplIndex}-${key}`] ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors duration-200`}
                                  value={editedData.operations[selectedOperationIndex].implementations[selectedImplIndex].complexity[key] || ""}
                                  onChange={(e) =>
                                    handleImplementationChange(selectedOperationIndex, selectedImplIndex, "complexity", {
                                      ...editedData.operations[selectedOperationIndex].implementations[selectedImplIndex].complexity,
                                      [key]: e.target.value.trim(),
                                    })
                                  }
                                  placeholder="O(...)"
                                />
                                {errors[`op-${selectedOperationIndex}-impl-${selectedImplIndex}-${key}`] && <p className="text-red-500 text-sm">{`${key} Complexity is required`}</p>}
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                    {editedData.operations.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeArrayItem("operations", selectedOperationIndex)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-base transition-colors duration-200"
                      >
                        <Trash2 size={18} /> Remove Operation
                      </motion.button>
                    )}
                  </motion.div>
                )}
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-3">
                  Full Implementations
                </h2>
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Full Implementations <span className="text-red-500">*</span>
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => addArrayItem("fullImplementations", { language: "", code: "" })}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-base transition-colors duration-200"
                  >
                    <Plus size={18} /> Add Implementation
                  </motion.button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {editedData.fullImplementations.map((code, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedCodeIndex(index)}
                      className={`px-4 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${selectedCodeIndex === index ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"}`}
                    >
                      {code.language || `Impl ${index + 1}`}
                    </motion.button>
                  ))}
                </div>
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="text"
                      placeholder="Language (e.g., JavaScript)"
                      value={editedData.fullImplementations[selectedCodeIndex].language || ""}
                      onChange={(e) => {
                        const updated = [...editedData.fullImplementations];
                        updated[selectedCodeIndex].language = e.target.value.trim();
                        handleChange("fullImplementations", updated);
                      }}
                      className={`flex-grow p-3 rounded-lg bg-white dark:bg-gray-900 border ${errors[`fullImpl-${selectedCodeIndex}-language`] ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors duration-200`}
                    />
                    {editedData.fullImplementations.length > 1 && (
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => removeArrayItem("fullImplementations", selectedCodeIndex)}
                        className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                      >
                        <Trash2 size={20} />
                      </motion.button>
                    )}
                  </div>
                  {errors[`fullImpl-${selectedCodeIndex}-language`] && <p className="text-red-500 text-sm">Language is required</p>}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-lg overflow-hidden border border-gray-300 dark:border-gray-700"
                  >
                    <MonacoEditor
                      height={calculateEditorHeight(editedData.fullImplementations[selectedCodeIndex].code || "")}
                      language={editedData.fullImplementations[selectedCodeIndex].language.toLowerCase() || "javascript"}
                      value={editedData.fullImplementations[selectedCodeIndex].code || ""}
                      onChange={(code) => {
                        const updated = [...editedData.fullImplementations];
                        updated[selectedCodeIndex].code = code;
                        handleChange("fullImplementations", updated);
                      }}
                      theme="vs-dark"
                      options={{
                        minimap: { enabled: false },
                        fontSize: 16,
                        wordWrap: "on",
                        automaticLayout: true,
                        scrollBeyondLastLine: false,
                        roundedSelection: true,
                        padding: { top: 10, bottom: 10 },
                        tabSize: 2,
                      }}
                    />
                  </motion.div>
                  {errors[`fullImpl-${selectedCodeIndex}-code`] && <p className="text-red-500 text-sm">Code is required</p>}
                </motion.div>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-3">
                  Applications
                </h2>
                {editedData.applications.map((app, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Application {index + 1}: {app.domain || "Untitled"}
                      </h4>
                      {editedData.applications.length > 1 && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeArrayItem("applications", index)}
                          className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                        >
                          <Trash2 size={20} />
                        </motion.button>
                      )}
                    </div>
                    {renderInput(
                      "Domain",
                      app.domain,
                      (val) => {
                        const updated = [...editedData.applications];
                        updated[index].domain = val;
                        handleChange("applications", updated);
                      },
                      false,
                      true,
                      errors[`app-${index}-domain`],
                      "text",
                      "e.g., Databases"
                    )}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <h5 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                          Examples <span className="text-red-500">*</span>
                        </h5>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => addNestedArrayItem("applications", index, "examples", "")}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-base transition-colors duration-200"
                        >
                          <Plus size={18} /> Add Example
                        </motion.button>
                      </div>
                      {app.examples.map((example, exIndex) => (
                        <motion.div key={exIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="flex items-center gap-3">
                          <input
                            type="text"
                            value={example || ""}
                            onChange={(e) => {
                              const updated = [...editedData.applications];
                              updated[index].examples[exIndex] = e.target.value.trim();
                              handleChange("applications", updated);
                            }}
                            className={`flex-grow p-3 rounded-lg bg-white dark:bg-gray-900 border ${errors[`app-${index}-examples`] ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors duration-200`}
                            placeholder="e.g., Autocomplete"
                          />
                          {app.examples.length > 1 && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => removeNestedArrayItem("applications", index, "examples", exIndex)}
                              className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                            >
                              <Trash2 size={20} />
                            </motion.button>
                          )}
                        </motion.div>
                      ))}
                      {errors[`app-${index}-examples`] && <p className="text-red-500 text-sm">At least one non-empty example is required</p>}
                    </div>
                  </motion.div>
                ))}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addArrayItem("applications", { domain: "", examples: [""] })}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-base transition-colors duration-200"
                >
                  <Plus size={18} /> Add Application
                </motion.button>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-3">
                  Comparisons
                </h2>
                {editedData.comparisons.map((comp, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700 space-y-4"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        Comparison {index + 1}: {comp.with || "Untitled"}
                      </h4>
                      {editedData.comparisons.length > 1 && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeArrayItem("comparisons", index)}
                          className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                        >
                          <Trash2 size={20} />
                        </motion.button>
                      )}
                    </div>
                    {renderInput(
                      "Compare With",
                      comp.with,
                      (val) => {
                        const updated = [...editedData.comparisons];
                        updated[index].with = val;
                        handleChange("comparisons", updated);
                      },
                      false,
                      true,
                      errors[`comp-${index}-with`],
                      "text",
                      "e.g., Hash Table"
                    )}
                    {["advantages", "disadvantages"].map((field) => (
                      <div key={field} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <h5 className="text-base font-semibold text-gray-900 dark:text-gray-100 capitalize">
                            {field} <span className="text-red-500">*</span>
                          </h5>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => addNestedArrayItem("comparisons", index, field, "")}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-base transition-colors duration-200"
                          >
                            <Plus size={18} /> Add {field.slice(0, -1)}
                          </motion.button>
                        </div>
                        {comp[field].map((item, itemIndex) => (
                          <motion.div
                            key={itemIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="flex items-center gap-3"
                          >
                            <input
                              type="text"
                              value={item || ""}
                              onChange={(e) => {
                                const updated = [...editedData.comparisons];
                                updated[index][field][itemIndex] = e.target.value.trim();
                                handleChange("comparisons", updated);
                              }}
                              className={`flex-grow p-3 rounded-lg bg-white dark:bg-gray-900 border ${errors[`comp-${index}-${field}`] ? "border-red-500" : "border-gray-300 dark:border-gray-700"} focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors duration-200`}
                              placeholder={field === "advantages" ? "Advantage" : "Disadvantage"}
                            />
                            {comp[field].length > 1 && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => removeNestedArrayItem("comparisons", index, field, itemIndex)}
                                className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                              >
                                <Trash2 size={20} />
                              </motion.button>
                            )}
                          </motion.div>
                        ))}
                        {errors[`comp-${index}-${field}`] && <p className="text-red-500 text-sm">{`At least one non-empty ${field.slice(0, -1)} is required`}</p>}
                      </div>
                    ))}
                    {renderInput(
                      "When to Use",
                      comp.whenToUse,
                      (val) => {
                        const updated = [...editedData.comparisons];
                        updated[index].whenToUse = val;
                        handleChange("comparisons", updated);
                      },
                      true,
                      true,
                      errors[`comp-${index}-whenToUse`],
                      "text",
                      "When to prefer this structure."
                    )}
                  </motion.div>
                ))}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => addArrayItem("comparisons", { with: "", advantages: [""], disadvantages: [""], whenToUse: "" })}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-base transition-colors duration-200"
                >
                  <Plus size={18} /> Add Comparison
                </motion.button>
              </section>

              <section className="space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-3">
                  Metadata
                </h2>
                {["tags", "references", "videoLinks"].map((field) => (
                  <motion.div
                    key={field}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 capitalize">
                        {field.replace(/([A-Z])/g, " $1").trim()}
                      </h3>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addArrayItem(field, "")}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 text-base transition-colors duration-200"
                      >
                        <Plus size={18} /> Add {field.replace(/([A-Z])/g, " $1").trim().slice(0, -1)}
                      </motion.button>
                    </div>
                    {editedData[field].map((item, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex items-center gap-3"
                      >
                        <input
                          type={field === "tags" ? "text" : "url"}
                          value={item || ""}
                          onChange={(e) => updateArrayItem(field, i, e.target.value.trim())}
                          className="flex-grow p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base transition-colors duration-200"
                          placeholder={field === "tags" ? "e.g., trie" : field === "references" ? "https://example.com" : "https://youtube.com/..."}
                        />
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => removeArrayItem(field, i)}
                          className="p-2 text-red-500 hover:text-red-700 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors duration-200"
                        >
                          <Trash2 size={20} />
                        </motion.button>
                      </motion.div>
                    ))}
                  </motion.div>
                ))}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Statistics</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="block text-base font-medium text-gray-800 dark:text-gray-200">Upvotes</label>
                      <input
                        type="text"
                        value={editedData.upvotes || 0}
                        readOnly
                        className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-base font-medium text-gray-800 dark:text-gray-200">Downvotes</label>
                      <input
                        type="text"
                        value={editedData.downvotes || 0}
                        readOnly
                        className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700 text-base"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-base font-medium text-gray-800 dark:text-gray-200">Views</label>
                      <input
                        type="text"
                        value={editedData.views || 0}
                        readOnly
                        className="w-full p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-700 text-base"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="block text-base font-medium text-gray-800 dark:text-gray-200">Contributor</label>
                    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-500 dark:text-gray-400 text-base">
                      <p>
                        <span className="font-medium">Contributor ID:</span>{" "}
                        {dataStructure.contributor?.toString() || "Unknown"}
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onCancel}
                  className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-base font-medium transition-colors duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSave}
                  className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 text-base font-medium transition-colors duration-200"
                >
                  Save
                </motion.button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EditDataStructureForm;