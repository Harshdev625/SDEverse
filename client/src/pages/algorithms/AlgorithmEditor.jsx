import { useState, useEffect } from "react";
import AlgorithmFields from "./AlgorithmFields";
import AlgorithmPreview from "../../components/preview/AlgorithmPreview";

const AlgorithmEditor = ({
  initialData = {},
  categories = [],
  onChange,
  preview = false,
  setPreview = () => {},
}) => {
  const [formData, setFormData] = useState({
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
    ...initialData,
  });

  useEffect(() => {
    onChange?.(formData);
  }, [formData,onChange]);

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8">
      <div className="flex gap-4 border-b pb-4">
        <button
          onClick={() => setPreview(false)}
          className={`text-sm px-4 py-2 rounded-md ${!preview ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Edit
        </button>
        <button
          onClick={() => setPreview(true)}
          className={`text-sm px-4 py-2 rounded-md ${preview ? "bg-blue-600 text-white" : "bg-gray-200"}`}
        >
          Preview
        </button>
      </div>

      {preview ? (
        <AlgorithmPreview algorithm={formData} />
      ) : (
        <AlgorithmFields
          formData={formData}
          updateField={updateField}
          categories={categories}
        />
      )}
    </div>
  );
};

export default AlgorithmEditor;
