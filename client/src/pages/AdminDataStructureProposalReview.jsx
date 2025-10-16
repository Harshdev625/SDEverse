import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProposals,
  reviewExistingProposal,
} from "../features/dataStructureProposal/dataStructureProposalSlice";
import { FileText, ChevronDown } from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import DataStructurePreview from "./DataStructurePreview";

const AdminDataStructureProposalReview = () => {
  const dispatch = useDispatch();
  const { proposals, loading, error, pages, currentPage, total } = useSelector(
    (state) => state.dataStructureProposal || {}
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [expandedProposalId, setExpandedProposalId] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("approved");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  useEffect(() => {
    dispatch(
      fetchProposals({ page, limit, search, status: statusFilter || undefined })
    );
  }, [dispatch, page, limit, search, statusFilter]);

  const toggleExpand = (proposal) => {
    const isAlreadyOpen = expandedProposalId === proposal._id;
    setExpandedProposalId(isAlreadyOpen ? null : proposal._id);
    setReviewStatus(proposal.status || "pending");
    setReviewComment(proposal.reviewComment || "");
  };

  const handleReviewSubmit = async (e, proposal) => {
    e.preventDefault();
    setReviewLoading(true);

    try {
      await dispatch(
        reviewExistingProposal({
          slug: proposal.slug,
          reviewData: {
            status: reviewStatus,
            reviewComment,
          },
        })
      ).unwrap();

      toast.success("Data structure proposal reviewed successfully.");
      setExpandedProposalId(null);
      dispatch(fetchProposals({ page, limit, search, status: statusFilter }));
    } catch (err) {
      toast.error("Failed to review proposal: " + (err || "Unknown error"));
    } finally {
      setReviewLoading(false);
    }
  };

  const renderPagination = () => {
    const buttons = [];
    const maxButtons = 5;
    let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
    let endPage = Math.min(pages, startPage + maxButtons - 1);

    if (endPage - startPage + 1 < maxButtons) {
      startPage = Math.max(1, endPage - maxButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <motion.button
          key={i}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setPage(i)}
          disabled={i === page}
          className={`px-4 py-2 rounded-lg text-base font-medium transition-colors duration-200 ${
            i === page
              ? "bg-blue-600 text-white cursor-default"
              : "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-gray-300 dark:border-gray-700"
          }`}
          aria-current={i === page ? "page" : undefined}
        >
          {i}
        </motion.button>
      );
    }

    return (
      <nav
        className="flex justify-center items-center space-x-2 mt-8 flex-wrap gap-3"
        aria-label="Pagination"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-700 text-base font-medium transition-colors duration-200"
        >
          Prev
        </motion.button>
        {buttons}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
          disabled={page === pages}
          className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed border border-gray-300 dark:border-gray-700 text-base font-medium transition-colors duration-200"
        >
          Next
        </motion.button>
      </nav>
    );
  };

  const statusOptions = ["", "pending", "approved", "rejected", "merged"];
  const statusDisplay = {
    "": "All Statuses",
    pending: "Pending",
    approved: "Approved",
    rejected: "Rejected",
    merged: "Merged",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-7xl mx-auto p-4 sm:p-6 md:p-8"
    >
      <ToastContainer position="top-right" autoClose={3000} theme="colored" />

      <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-8 flex items-center justify-center gap-3">
        <FileText size={28} /> Data Structure Proposal Review
      </h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="flex flex-col sm:flex-row sm:justify-center gap-4 mb-8"
      >
        <input
          type="text"
          placeholder="Search by title, category"
          value={search}
          onChange={(e) => setSearch(e.target.value.trim())}
          className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500 text-base w-full sm:w-80 transition-colors duration-200"
        />
        <div className="relative w-full sm:w-64">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className="w-full p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-base text-left flex items-center justify-between focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500 transition-colors duration-200"
          >
            <span>{statusDisplay[statusFilter]}</span>
            <motion.div animate={{ rotate: showStatusDropdown ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={20} />
            </motion.div>
          </motion.button>
          {showStatusDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-10 mt-2 w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 max-h-60 overflow-auto"
            >
              {statusOptions.map((opt) => (
                <motion.button
                  key={opt}
                  whileHover={{ backgroundColor: "#e5e7eb" }}
                  onClick={() => {
                    setStatusFilter(opt);
                    setShowStatusDropdown(false);
                  }}
                  className={`w-full px-4 py-2 text-base text-left transition-colors duration-200 ${
                    statusFilter === opt
                      ? "bg-blue-100 dark:bg-blue-900/30 font-medium"
                      : "hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  {statusDisplay[opt]}
                </motion.button>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>

      {loading && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-600 dark:text-gray-400 text-base"
        >
          Loading proposals...
        </motion.p>
      )}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-red-500 font-semibold text-base"
        >
          Error: {typeof error === "string" ? error : error.message || "Unknown error"}
        </motion.p>
      )}

      {!loading && proposals?.length === 0 && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-gray-500 dark:text-gray-400 text-base"
        >
          No data structure proposals found.
        </motion.p>
      )}

      {!loading && proposals?.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-gray-700 dark:text-gray-200">
              <thead className="bg-gray-100 dark:bg-gray-800 text-sm font-semibold uppercase">
                <tr>
                  <th className="px-6 py-4 w-[25%]">Title</th>
                  <th className="px-6 py-4 w-[15%]">Contributor</th>
                  <th className="px-6 py-4 w-[20%]">Category</th>
                  <th className="px-6 py-4 w-[10%]">Type</th>
                  <th className="px-6 py-4 w-[10%]">Status</th>
                  <th className="px-6 py-4 w-[10%]">Created</th>
                  <th className="px-6 py-4 text-center w-[10%]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal) => (
                  <React.Fragment key={proposal._id}>
                    <motion.tr
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 truncate max-w-[200px] text-base">{proposal.title}</td>
                      <td className="px-6 py-4 truncate max-w-[150px] text-base">
                        {proposal.contributor?.username || "N/A"}
                      </td>
                      <td className="px-6 py-4 truncate max-w-[200px] text-base">
                        {proposal.category?.join(", ") || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-base">{proposal.type || "N/A"}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            proposal.status === "approved"
                              ? "text-green-700 bg-green-100 dark:bg-green-900/30"
                              : proposal.status === "rejected"
                              ? "text-red-700 bg-red-100 dark:bg-red-900/30"
                              : proposal.status === "merged"
                              ? "text-blue-700 bg-blue-100 dark:bg-blue-900/30"
                              : "text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30"
                          }`}
                        >
                          {proposal.status || "pending"}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-base">
                        {proposal.createdAt
                          ? new Date(proposal.createdAt).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleExpand(proposal)}
                          className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors duration-200"
                        >
                          {expandedProposalId === proposal._id ? "Close" : "Review"}
                        </motion.button>
                      </td>
                    </motion.tr>

                    {expandedProposalId === proposal._id && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="bg-gray-50 dark:bg-gray-800 border-t border-b border-gray-200 dark:border-gray-700"
                      >
                        <td colSpan="7" className="p-6">
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            className="space-y-6"
                          >
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">
                              Proposal Preview: {proposal.title}
                            </h2>
                            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
                              <DataStructurePreview dataStructure={proposal} />
                            </div>

                            <form
                              onSubmit={(e) => handleReviewSubmit(e, proposal)}
                              className="mt-6 space-y-6"
                            >
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-2"
                              >
                                <label className="block text-base font-medium text-gray-800 dark:text-gray-200">
                                  Review Status
                                </label>
                                <div className="relative w-full sm:w-64">
                                  <select
                                    id="reviewStatus"
                                    value={reviewStatus}
                                    onChange={(e) => setReviewStatus(e.target.value)}
                                    className="w-full p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500 text-base transition-colors duration-200 appearance-none pr-10"
                                  >
                                    <option value="approved">Approve</option>
                                    <option value="rejected">Reject</option>
                                    <option value="pending">Pending</option>
                                    <option value="merged">Merged</option>
                                  </select>
                                  <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                                    <ChevronDown size={20} className="text-gray-500 dark:text-gray-300" />
                                  </div>
                                </div>
                              </motion.div>

                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="space-y-2"
                              >
                                <label className="block text-base font-medium text-gray-800 dark:text-gray-200">
                                  Review Comment
                                </label>
                                <textarea
                                  value={reviewComment}
                                  onChange={(e) => setReviewComment(e.target.value)}
                                  className="w-full p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500 text-base transition-colors duration-200"
                                  rows={5}
                                  placeholder="Optional comment for contributor"
                                />
                              </motion.div>

                              <div className="flex justify-end gap-4">
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  type="button"
                                  onClick={() => setExpandedProposalId(null)}
                                  className="px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 text-base font-medium transition-colors duration-200"
                                >
                                  Cancel
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  type="submit"
                                  disabled={reviewLoading}
                                  className="px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-base font-medium transition-colors duration-200"
                                >
                                  Submit Review
                                </motion.button>
                              </div>
                            </form>
                          </motion.div>
                        </td>
                      </motion.tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
          {renderPagination()}
        </motion.div>
      )}
    </motion.div>
  );
};

export default AdminDataStructureProposalReview;