import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { DotLoader } from "react-spinners";
import DataStructureProposalForm from "../../components/forms/DataStructureProposalForm";
import { fetchProposalDetails, saveUpdatedProposal } from "../../features/dataStructureProposal/dataStructureProposalSlice";
import { fetchDataStructureCategories } from "../../features/dataStructure/dataStructureSlice";
import { toast } from "react-toastify";

const EditDataStructureProposal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { slug } = useParams();

  const { currentProposal, loading: dsProposalLoading } = useSelector((state) => state.dataStructureProposal);
  const { categories: dsCategories, categoriesLoading } = useSelector((state) => state.dataStructure);

  const [formData, setFormData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    dispatch(fetchProposalDetails(slug));
    dispatch(fetchDataStructureCategories());
  }, [dispatch, slug]);

  useEffect(() => {
    if (currentProposal) {
      setFormData(currentProposal);
    }
  }, [currentProposal]);

  const handleFormChange = (data) => {
    setFormData(data);
  };

  const handleSubmit = async () => {
    if (!formData) {
      toast.error("Form data is not initialized.");
      return;
    }

    const { isValid, errors } = formRef.current.validate();
    if (!isValid) {
      const errorMessages = [];
      if (errors.title) errorMessages.push("Title");
      if (errors.definition) errorMessages.push("Definition");
      if (errors.type) errorMessages.push("Type");
      if (errors.characteristics) errorMessages.push("Characteristics");
      if (errors.category) errorMessages.push("Category");
      Object.keys(errors).forEach((key) => {
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
        if (key.startsWith("app-") && key.includes("-domain")) errorMessages.push("Application Domain");
        if (key.startsWith("comp-")) {
          if (key.includes("-with")) errorMessages.push("Comparison With");
          if (key.includes("-whenToUse")) errorMessages.push("Comparison When To Use");
        }
      });
      const uniqueErrors = [...new Set(errorMessages)];
      toast.error(`Missing required fields: ${uniqueErrors.join(", ")}`);
      return;
    }

    setSubmitting(true);
    try {
      await dispatch(saveUpdatedProposal({ slug, proposalData: formData })).unwrap();
      toast.success("Data Structure proposal updated successfully!");
      navigate(-1);
    } catch (err) {
      console.error("Data Structure proposal update failed", err);
      toast.error(err.message || "Something went wrong during submission.");
    } finally {
      setSubmitting(false);
    }
  };

  if (dsProposalLoading || categoriesLoading || !formData || dsCategories.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <DotLoader color="#3B82F6" size={60} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl 2xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8 lg:p-10 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-2">
            Edit Data Structure Proposal
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            Update your data structure proposal details
          </p>
        </div>
        <div className="p-6 sm:p-8 lg:p-10">
          <DataStructureProposalForm
            initialData={formData}
            dsCategories={dsCategories}
            onSave={handleFormChange}
            ref={formRef}
          />
        </div>
        <div className="p-6 sm:p-8 lg:p-10 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 sm:px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-medium hover:from-indigo-700 hover:to-purple-800 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex items-center justify-center shadow-lg hover:shadow-xl"
              type="button"
            >
              {submitting ? <DotLoader color="#fff" size={20} className="mr-2" /> : null}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditDataStructureProposal;