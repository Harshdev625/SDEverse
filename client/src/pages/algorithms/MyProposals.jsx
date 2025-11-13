import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProposals as fetchDataStructureProposals,
  clearError as clearDataStructureError,
} from "../../features/dataStructureProposal/dataStructureProposalSlice";
import {
  fetchProposals as fetchAlgorithmProposals,
  clearProposalError,
} from "../../features/proposal/proposalSlice";
import { useNavigate } from "react-router-dom";
import { FileText, PenLine, Search, ArrowUpDown } from "lucide-react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { ClipLoader } from "react-spinners";
import { Tooltip } from "react-tooltip";
import Pagination from "../shared/Pagination";

function useDebounce(value, delay) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debounced;
}

const MyProposals = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    proposals: dataStructureProposals,
    loading: dsLoading,
    error: dsError,
    total: dsTotal,
    pages: dsPages,
    currentPage: dsCurrentPage,
  } = useSelector((state) => state.dataStructureProposal);

  const {
    proposals: algorithmProposals,
    loading: algoLoading,
    error: algoError,
    total: algoTotal,
    pages: algoPages,
    currentPage: algoCurrentPage,
  } = useSelector((state) => state.proposal);

  const [activeTab, setActiveTab] = useState("data-structure");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");
  const [dsPage, setDsPage] = useState(1);
  const [algoPage, setAlgoPage] = useState(1);
  const itemsPerPage = 10;
  const debouncedSearch = useDebounce(searchText, 500);

  useEffect(() => {
    const query = {
      page: activeTab === "data-structure" ? dsPage : algoPage,
      limit: itemsPerPage,
      ...(statusFilter && { status: statusFilter }),
      ...(debouncedSearch && { search: debouncedSearch }),
      sortBy,
      sortOrder,
    };

    if (activeTab === "data-structure") {
      dispatch(fetchDataStructureProposals(query));
    } else {
      dispatch(fetchAlgorithmProposals(query));
    }
  }, [
    dispatch,
    activeTab,
    dsPage,
    algoPage,
    statusFilter,
    debouncedSearch,
    sortBy,
    sortOrder,
  ]);

  useEffect(() => {
    if (dsError && activeTab === "data-structure") {
      toast.error(dsError, {
        position: "top-right",
        autoClose: 3000,
        onClose: () => dispatch(clearDataStructureError()),
      });
    }
    if (algoError && activeTab === "algorithm") {
      toast.error(algoError, {
        position: "top-right",
        autoClose: 3000,
        onClose: () => dispatch(clearProposalError()),
      });
    }
  }, [dsError, algoError, activeTab, dispatch]);

  const handleEdit = (proposal, type) => {
    const path =
      type === "data-structure"
        ? `/data-structure-proposals/${proposal.slug}/edit`
        : `/proposals/${proposal.slug}/edit`;
    navigate(path);
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "approved":
        return "text-green-700 bg-green-100 dark:bg-green-900/30";
      case "rejected":
        return "text-red-700 bg-red-100 dark:bg-red-900/30";
      case "merged":
        return "text-blue-700 bg-blue-100 dark:bg-blue-900/30";
      case "pending":
      default:
        return "text-yellow-700 bg-yellow-100 dark:bg-yellow-900/30";
    }
  };

  const handleStatusChange = (e) => {
    setStatusFilter(e.target.value);
    setDsPage(1);
    setAlgoPage(1);
  };

  const handleSearchChange = (e) => {
    setSearchText(e.target.value);
    setDsPage(1);
    setAlgoPage(1);
  };

  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setDsPage(1);
    setAlgoPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchText("");
    setStatusFilter("");
    if (tab === "data-structure") setDsPage(1);
    else setAlgoPage(1);
  };

  const currentProposals =
    activeTab === "data-structure"
      ? dataStructureProposals
      : algorithmProposals;
  const currentLoading =
    activeTab === "data-structure" ? dsLoading : algoLoading;
  const currentTotal = activeTab === "data-structure" ? dsTotal : algoTotal;
  const currentPages = activeTab === "data-structure" ? dsPages : algoPages;
  const currentPage =
    activeTab === "data-structure" ? dsCurrentPage : algoCurrentPage;

  const SkeletonRow = () => (
    <div
      className={`block md:grid gap-4 px-6 py-4 animate-pulse ${
        activeTab === "data-structure"
          ? "md:grid-cols-[2fr_1fr_1fr_1fr_auto]"
          : "md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]"
      }`}
    >
      <div className="mb-3 md:mb-0">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      </div>
      <div className="mb-3 md:mb-0">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
      {activeTab === "algorithm" && (
        <div className="mb-3 md:mb-0">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      )}
      <div className="mb-3 md:mb-0">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      </div>
      <div className="mb-3 md:mb-0">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
      </div>
      <div className="flex md:justify-center">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <Motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
      >
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
          <FileText
            className="text-indigo-600 dark:text-indigo-400"
            size={28}
          />
          My Proposals
        </h1>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              value={searchText}
              onChange={handleSearchChange}
              placeholder={`Search ${
                activeTab === "data-structure" ? "data structure" : "algorithm"
              } proposals...`}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
              aria-label={`Search ${
                activeTab === "data-structure" ? "data structure" : "algorithm"
              } proposals`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={handleStatusChange}
            className="rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 px-4 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
            {activeTab === "data-structure" && (
              <option value="merged">Merged</option>
            )}
          </select>
        </div>
      </Motion.div>

      <Motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="mb-6"
      >
        <div className="sm:flex sm:border-b sm:border-gray-200 dark:sm:border-gray-700 hidden">
          <Motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleTabChange("data-structure")}
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              activeTab === "data-structure"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
            aria-selected={activeTab === "data-structure"}
            role="tab"
          >
            Data Structure Proposals
          </Motion.button>
          <Motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleTabChange("algorithm")}
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              activeTab === "algorithm"
                ? "text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            }`}
            aria-selected={activeTab === "algorithm"}
            role="tab"
          >
            Algorithm Proposals
          </Motion.button>
        </div>
        <div className="sm:hidden">
          <select
            value={activeTab}
            onChange={(e) => handleTabChange(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 py-2 px-4 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
            aria-label="Select proposal type"
          >
            <option value="data-structure">Data Structure Proposals</option>
            <option value="algorithm">Algorithm Proposals</option>
          </select>
        </div>
      </Motion.div>

      {currentLoading && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {[...Array(5)].map((_, index) => (
            <SkeletonRow key={index} />
          ))}
        </Motion.div>
      )}

      {!currentLoading && currentProposals.length === 0 && (
        <Motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 p-8 text-center"
        >
          <div className="mx-auto bg-gray-200 dark:bg-gray-700 rounded-full p-3 w-16 h-16 flex items-center justify-center mb-4">
            <FileText className="text-gray-500 dark:text-gray-400" size={28} />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
            No {activeTab === "data-structure" ? "data structure" : "algorithm"}{" "}
            proposals found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search or filter criteria
          </p>
        </Motion.div>
      )}

      {!currentLoading && currentProposals.length > 0 && (
        <Motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div
              className={`hidden md:grid gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-800/50 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider ${
                activeTab === "data-structure"
                  ? "grid-cols-[2fr_1fr_1fr_1fr_auto]"
                  : "grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]"
              }`}
            >
              <button
                onClick={() => handleSortChange("title")}
                className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                Title
                {sortBy === "title" && (
                  <ArrowUpDown
                    size={14}
                    className={sortOrder === "asc" ? "rotate-180" : ""}
                  />
                )}
              </button>
              <div>Category</div>
              {activeTab === "algorithm" && <div>Difficulty</div>}
              <button
                onClick={() => handleSortChange("status")}
                className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                Status
                {sortBy === "status" && (
                  <ArrowUpDown
                    size={14}
                    className={sortOrder === "asc" ? "rotate-180" : ""}
                  />
                )}
              </button>
              <button
                onClick={() => handleSortChange("createdAt")}
                className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400"
              >
                Created
                {sortBy === "createdAt" && (
                  <ArrowUpDown
                    size={14}
                    className={sortOrder === "asc" ? "rotate-180" : ""}
                  />
                )}
              </button>
              <div className="text-center">Actions</div>
            </div>

            <AnimatePresence>
              {currentProposals.map((proposal) => (
                <Motion.div
                  key={proposal._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className={`block md:grid gap-4 px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors duration-200 ${
                    activeTab === "data-structure"
                      ? "md:grid-cols-[2fr_1fr_1fr_1fr_auto]"
                      : "md:grid-cols-[2fr_1fr_1fr_1fr_1fr_auto]"
                  }`}
                >
                  <div className="mb-3 md:mb-0">
                    <div className="md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Title
                    </div>
                    <div
                      className="font-medium text-gray-900 dark:text-white truncate max-w-[200px]"
                      data-tooltip-id={`title-tooltip-${proposal._id}`}
                      data-tooltip-content={proposal.title}
                    >
                      {proposal.title}
                    </div>
                    <Tooltip id={`title-tooltip-${proposal._id}`} place="top" />
                  </div>

                  <div className="mb-3 md:mb-0">
                    <div className="md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Category
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                      {proposal.category?.join(", ") || "N/A"}
                    </div>
                  </div>

                  {activeTab === "algorithm" && (
                    <div className="mb-3 md:mb-0">
                      <div className="md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                        Difficulty
                      </div>
                      <div className="text-gray-700 dark:text-gray-300">
                        {proposal.difficulty || "N/A"}
                      </div>
                    </div>
                  )}

                  <div className="mb-3 md:mb-0">
                    <div className="md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Status
                    </div>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusStyle(
                        proposal.status
                      )}`}
                      data-tooltip-id={`status-tooltip-${proposal._id}`}
                      data-tooltip-content={proposal.status || "pending"}
                    >
                      {proposal.status || "pending"}
                    </span>
                    <Tooltip
                      id={`status-tooltip-${proposal._id}`}
                      place="top"
                    />
                  </div>

                  <div className="mb-4 md:mb-0">
                    <div className="md:hidden text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                      Created
                    </div>
                    <div className="text-gray-700 dark:text-gray-300">
                      {new Date(proposal.createdAt).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex md:justify-center">
                    <Motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleEdit(proposal, activeTab)}
                      className="inline-flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium text-sm transition-colors"
                      aria-label={`Edit ${proposal.title}`}
                    >
                      <PenLine size={16} />
                      <span>Edit</span>
                    </Motion.button>
                  </div>
                </Motion.div>
              ))}
            </AnimatePresence>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={currentPages}
            onPageChange={(newPage) => {
              if (activeTab === "data-structure") setDsPage(newPage);
              else setAlgoPage(newPage);
            }}
            className="mt-6"
          />
        </Motion.div>
      )}
    </div>
  );
};

export default MyProposals;
