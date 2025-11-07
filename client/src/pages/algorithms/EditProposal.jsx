import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { DotLoader } from "react-spinners";
import ProposalForm from "../../components/forms/ProposalForm";
import {
  fetchProposalDetails,
  saveUpdatedProposal,
} from "../../features/proposal/proposalSlice";
import { fetchCategories } from "../../features/algorithm/algorithmSlice";
import { motion as Motion } from "framer-motion";
import { ChevronLeft } from "lucide-react";

const EditProposal = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { slug } = useParams();

  const { currentProposal, loading: proposalLoading } = useSelector(
    (state) => state.proposal
  );
  const { categories, loading: categoriesLoading } = useSelector(
    (state) => state.algorithm
  );

  const [formData, setFormData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState("edit");

  useEffect(() => {
    if (!categories || categories.length === 0) {
      dispatch(fetchCategories());
    }
    if (!currentProposal || currentProposal.slug !== slug) {
      dispatch(fetchProposalDetails(slug));
    }
  }, [dispatch, slug, currentProposal, categories]);

  useEffect(() => {
    if (currentProposal) {
      setFormData(currentProposal);
    }
  }, [currentProposal]);

  const handleFormChange = (data) => {
    setFormData(data);
  };

  const handleSubmit = async () => {
    if (!formData || !formData.title.trim()) {
      alert("Proposal title cannot be empty.");
      return;
    }
    setSubmitting(true);
    try {
      await dispatch(
        saveUpdatedProposal({ slug, proposalData: formData })
      ).unwrap();
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (proposalLoading || categoriesLoading || !formData) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-950">
        <DotLoader color="#6366F1" size={60} />
      </div>
    );
  }

  const isSaveDisabled = !formData.title?.trim() || submitting;

  return (
    <Motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-6xl 2xl:max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-10"
    >
      <div className="bg-white dark:bg-gray-850 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-750 transform transition-all duration-300 hover:shadow-3xl">
        <div className="p-6 md:p-8 lg:p-10 border-b border-gray-100 dark:border-gray-750 flex items-center justify-between">
          <Motion.button
            onClick={handleCancel}
            className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200"
            whileHover={{ x: -2 }}
          >
            <ChevronLeft className="w-5 h-5 mr-1" />
            Back
          </Motion.button>
          <div className="text-right">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">
              Edit Proposal
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Refine your algorithm's details
            </p>
          </div>
        </div>

        <div className="flex border-b border-gray-100 dark:border-gray-750 bg-gray-50 dark:bg-gray-800">
          {["edit", "preview"].map((tab) => (
            <button
              key={tab}
              onClick={() => setMode(tab)}
              className={`flex-1 py-4 px-6 text-center text-lg font-semibold transition-all duration-300 relative group
                ${
                  mode === tab
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {mode === tab && (
                <Motion.span
                  layoutId="underline"
                  className="absolute bottom-0 left-0 w-full h-1 bg-blue-500 dark:bg-blue-400 rounded-t-lg"
                />
              )}
            </button>
          ))}
        </div>

        <div className="p-6 md:p-8 lg:p-10 bg-gray-25 dark:bg-gray-850">
          <ProposalForm
            proposal={formData}
            categories={categories}
            onSave={handleFormChange}
            mode={mode}
          />
        </div>

        <div className="p-6 md:p-8 lg:p-10 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-750">
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-4">
            <button
              onClick={handleCancel}
              className="px-6 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 flex items-center justify-center"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaveDisabled}
              className="px-8 py-3 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center"
              type="button"
            >
              {submitting ? (
                <DotLoader color="#fff" size={20} className="mr-2" />
              ) : null}
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </Motion.div>
  );
};

export default EditProposal;