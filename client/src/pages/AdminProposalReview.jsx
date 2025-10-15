import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProposals,
  reviewExistingProposal,
} from "../features/proposal/proposalSlice";
import { FileText } from "lucide-react";
import AlgorithmPreview from "./AlgorithmPreview";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminProposalReview = () => {
  const dispatch = useDispatch();
  const { proposals, loading, error, pages, currentPage, total } = useSelector(
    (state) => state.proposal
  );

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [expandedProposalId, setExpandedProposalId] = useState(null);
  const [reviewStatus, setReviewStatus] = useState("approved");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);

  // Fetch proposals on filter/page changes
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

      toast.success("Proposal reviewed successfully.");
      setExpandedProposalId(null);
      dispatch(fetchProposals({ page, limit, search, status: statusFilter }));
    } catch (err) {
      toast.error("Failed to review proposal: " + (err.message || err));
    } finally {
      setReviewLoading(false);
    }
  };

  // Pagination buttons helper
  const renderPagination = () => {
    const buttons = [];

    for (let i = 1; i <= pages; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setPage(i)}
          disabled={i === page}
          className={`px-3 py-1 rounded-md border transition-colors duration-200
            ${
              i === page
                ? "bg-blue-600 text-white cursor-default"
                : "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-gray-300 dark:border-gray-700"
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500`}
          aria-current={i === page ? "page" : undefined}
        >
          {i}
        </button>
      );
    }

    return (
      <nav
        className="flex justify-center items-center space-x-2 mt-6 flex-wrap gap-2"
        aria-label="Pagination"
      >
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 rounded-md border bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
        >
          Prev
        </button>
        {buttons}
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, pages))}
          disabled={page === pages}
          className="px-3 py-1 rounded-md border bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300 dark:border-gray-700"
        >
          Next
        </button>
      </nav>
    );
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <ToastContainer position="top-right" autoClose={3000} />

      <h1 className="text-4xl font-extrabold text-center mb-8 flex items-center justify-center gap-2 text-gray-800 dark:text-white">
        <FileText size={32} /> Users Proposal Review
      </h1>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:justify-center gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by title, category"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="p-3 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500 text-base w-full sm:w-80 max-w-full transition-colors duration-200"
        />
        <div className="relative inline-block w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="appearance-none w-full p-2 pr-8 border rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            <option value="merged">Merged</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>

      {loading && (
        <p className="text-center text-gray-500 dark:text-gray-300">
          Loading proposals...
        </p>
      )}
      {error && (
        <p className="text-center text-red-500 font-semibold">
          Error:{" "}
          {typeof error === "string"
            ? error
            : error.message || JSON.stringify(error)}
        </p>
      )}

      {!loading && proposals.length === 0 && (
        <p className="text-center text-gray-400 dark:text-gray-500">
          No proposals found.
        </p>
      )}

      {!loading && proposals.length > 0 && (
        <>
          <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-xl shadow-md">
            <table className="min-w-full text-sm text-left text-gray-700 dark:text-gray-200 table-auto">
              <thead className="bg-gray-100 dark:bg-gray-800 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-4 py-3 max-w-[150px] w-[20%] truncate">
                    Title
                  </th>
                  <th className="px-4 py-3 max-w-[120px] w-[15%] truncate">
                    Contributor
                  </th>
                  <th className="px-4 py-3 max-w-[150px] w-[20%] truncate">
                    Category
                  </th>
                  <th className="px-4 py-3 w-[10%]">Difficulty</th>
                  <th className="px-4 py-3 w-[10%]">Status</th>
                  <th className="px-4 py-3 w-[15%]">Created</th>
                  <th className="px-4 py-3 text-center w-[10%]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {proposals.map((proposal) => (
                  <React.Fragment key={proposal._id}>
                    <tr className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition">
                      <td className="px-4 py-3 max-w-[150px] truncate">
                        {proposal.title}
                      </td>
                      <td className="px-4 py-3 max-w-[120px] truncate">
                        {proposal.contributor?.username || "N/A"}
                      </td>
                      <td className="px-4 py-3 max-w-[150px] truncate">
                        {proposal.category.join(", ")}
                      </td>
                      <td className="px-4 py-3">{proposal.difficulty}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            proposal.status === "approved"
                              ? "text-green-700 bg-green-100"
                              : proposal.status === "rejected"
                              ? "text-red-700 bg-red-100"
                              : proposal.status === "merged"
                              ? "text-blue-700 bg-blue-100"
                              : "text-yellow-700 bg-yellow-100"
                          }`}
                        >
                          {proposal.status || "pending"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {new Date(proposal.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => toggleExpand(proposal)}
                          className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-blue-600 hover:underline"
                        >
                          {expandedProposalId === proposal._id
                            ? "Close"
                            : "Review"}
                        </button>
                      </td>
                    </tr>

                    {expandedProposalId === proposal._id && (
                      <tr className="bg-gray-50 dark:bg-gray-800 border-t border-b border-gray-300 dark:border-gray-700">
                        <td colSpan="7" className="p-4">
                          <AlgorithmPreview algorithm={proposal} />

                          <form
                            onSubmit={(e) => handleReviewSubmit(e, proposal)}
                            className="mt-4 space-y-4"
                          >
                            <div className="flex items-center gap-4 flex-wrap">
                              <div className="flex flex-col sm:flex-row sm:items-center gap-2 font-semibold">
                                <label
                                  htmlFor="reviewStatus"
                                  className="text-sm text-gray-800 dark:text-gray-200"
                                >
                                  Review Status:
                                </label>

                                <div className="relative w-full sm:w-52">
                                  <select
                                    id="reviewStatus"
                                    value={reviewStatus}
                                    onChange={(e) =>
                                      setReviewStatus(e.target.value)
                                    }
                                    className="appearance-none w-full p-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500"
                                  >
                                    <option value="approved">Approve</option>
                                    <option value="rejected">Reject</option>
                                    <option value="pending">Pending</option>
                                  </select>
                                  <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                                    <svg
                                      className="w-4 h-4 text-gray-500 dark:text-gray-300"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </svg>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div>
                              <label className="block font-semibold">
                                Review Comment:
                              </label>
                              <textarea
                                value={reviewComment}
                                onChange={(e) =>
                                  setReviewComment(e.target.value)
                                }
                                className="w-full mt-1 p-2 border rounded-md"
                                rows={4}
                                placeholder="Optional comment for contributor"
                              />
                            </div>

                            <div className="flex justify-end gap-4">
                              <button
                                type="button"
                                onClick={() => setExpandedProposalId(null)}
                                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={reviewLoading}
                                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                              >
                                Submit Review
                              </button>
                            </div>
                          </form>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>

          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default AdminProposalReview;
