import React, { useEffect, useState, useCallback, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchDataStructures,
  searchAllDataStructures,
  deleteExistingDataStructure,
  updateExistingDataStructure,
  createNewDataStructure,
  fetchDataStructureCategories,
} from "../features/dataStructure/dataStructureSlice";
import { MdEdit, MdDelete, MdSearch } from "react-icons/md";
import { toast } from "react-toastify";
import Loader from "../components/Loader";
import EditDataStructureForm from "../components/forms/EditDataStructureForm";
import Pagination from "./Pagination";
import clsx from "clsx";

// Helpers
const formatArray = (input) =>
  Array.isArray(input) ? input : input.split(",").map((v) => v.trim()).filter(Boolean);

const formatCodes = (input) =>
  Array.isArray(input) ? input : input.split("\n").map((code) => ({ language: "javascript", code }));

const formatOperations = (input) =>
  Array.isArray(input)
    ? input.map(op => ({
        ...op,
        implementations: Array.isArray(op.implementations)
          ? op.implementations
          : formatCodes(op.implementations),
      }))
    : [];

const formatApplications = (input) =>
  Array.isArray(input)
    ? input.map(app => ({
        ...app,
        examples: Array.isArray(app.examples)
          ? app.examples
          : app.examples.split(",").map((v) => v.trim()).filter(Boolean),
      }))
    : [];

const formatComparisons = (input) =>
  Array.isArray(input)
    ? input.map(comp => ({
        ...comp,
        advantages: Array.isArray(comp.advantages)
          ? comp.advantages
          : comp.advantages.split(",").map((v) => v.trim()).filter(Boolean),
        disadvantages: Array.isArray(comp.disadvantages)
          ? comp.disadvantages
          : comp.disadvantages.split(",").map((v) => v.trim()).filter(Boolean),
      }))
    : [];

const AdminDataStructures = () => {
  const dispatch = useDispatch();
  const { dataStructures = [], loading, categories = [], pages: totalPages } = useSelector((state) => state.dataStructure);

  const [search, setSearch] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [editingSlug, setEditingSlug] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isSearchMode, setIsSearchMode] = useState(false);

  useEffect(() => {
    const payload = isSearchMode
      ? { q: search, category: selectedCategories.join(","), page: currentPage }
      : { page: currentPage };

    dispatch(isSearchMode ? searchAllDataStructures(payload) : fetchDataStructures(payload));
    dispatch(fetchDataStructureCategories());
  }, [dispatch, currentPage, isSearchMode, search, selectedCategories]);

  const handleSearch = useCallback(() => {
    setIsSearchMode(true);
    setCurrentPage(1);
    dispatch(
      searchAllDataStructures({
        q: search,
        category: selectedCategories.join(","),
        page: 1,
      })
    );
  }, [dispatch, search, selectedCategories]);

  const handleDelete = (slug) => {
    dispatch(deleteExistingDataStructure(slug))
      .unwrap()
      .then(() => toast.success("Deleted successfully"))
      .catch(() => toast.error("Delete failed"));
  };

  const handleSave = (data) => {
    const formatted = {
      ...data,
      category: formatArray(data.category),
      tags: formatArray(data.tags),
      references: formatArray(data.references),
      videoLinks: formatArray(data.videoLinks),
      fullImplementations: formatCodes(data.fullImplementations),
      operations: formatOperations(data.operations),
      applications: formatApplications(data.applications),
      comparisons: formatComparisons(data.comparisons),
    };

    const action = addingNew
      ? createNewDataStructure(formatted)
      : updateExistingDataStructure({ slug: editingSlug, dataStructureData: formatted });

    dispatch(action)
      .unwrap()
      .then(() => {
        toast.success(addingNew ? "Created successfully" : "Updated successfully");
        setEditingSlug(null);
        setAddingNew(false);
        const payload = isSearchMode
          ? { q: search, category: selectedCategories.join(","), page: currentPage }
          : { page: currentPage };
        dispatch(isSearchMode ? searchAllDataStructures(payload) : fetchDataStructures(payload));
      })
      .catch(() => toast.error(addingNew ? "Creation failed" : "Update failed"));
  };

  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Manage Data Structures</h1>
        <button
          onClick={() => {
            setAddingNew(true);
            setEditingSlug(null);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl"
        >
          + New Data Structure
        </button>
      </div>

      {/* Add New Form */}
      {addingNew && (
        <div className="bg-white dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow">
          <EditDataStructureForm
            dataStructure={{}}
            categories={categories}
            onSave={handleSave}
            onCancel={() => {
              setAddingNew(false);
              setEditingSlug(null);
            }}
          />
        </div>
      )}

      {/* Search and Filter */}
      <div className="space-y-4">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search data structures..."
            className="w-full px-4 py-2 rounded-xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 focus:border-gray-400 dark:focus:border-gray-500"
          />
          <button
            onClick={handleSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-blue-600"
          >
            <MdSearch size={20} />
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={clsx(
                "px-3 py-1 rounded-full text-sm border transition",
                selectedCategories.includes(cat)
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white dark:bg-gray-800 rounded-xl shadow">
        <table className="min-w-full text-sm text-left text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white text-xs uppercase">
            <tr>
              <th className="px-6 py-3">Title</th>
              <th className="px-6 py-3">Category</th>
              <th className="px-6 py-3">Type</th>
              <th className="px-6 py-3">Status</th>
              <th className="px-6 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading && dataStructures.length === 0 ? (
              <tr>
                <td colSpan="5" className="text-center py-6">
                  <Loader />
                </td>
              </tr>
            ) : (
              dataStructures.map((ds) => (
                <Fragment key={ds.slug}>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      {ds.title}
                    </td>
                    <td className="px-6 py-4">
                      {Array.isArray(ds.category)
                        ? ds.category.join(", ")
                        : ds.category}
                    </td>
                    <td className="px-6 py-4">{ds.type}</td>
                    <td className="px-6 py-4">{ds.status}</td>
                    <td className="px-6 py-4 text-right space-x-4">
                      <button
                        onClick={() => {
                          setEditingSlug(ds.slug);
                          setAddingNew(false);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <MdEdit size={18} />
                      </button>
                      <button
                        onClick={() => handleDelete(ds.slug)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <MdDelete size={18} />
                      </button>
                    </td>
                  </tr>
                  {editingSlug === ds.slug && (
                    <tr className="bg-gray-50 dark:bg-gray-900">
                      <td colSpan="5" className="px-6 py-4">
                        <EditDataStructureForm
                          dataStructure={ds}
                          categories={categories}
                          onSave={handleSave}
                          onCancel={() => setEditingSlug(null)}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages || 1}
        onPageChange={(page) => setCurrentPage(page)}
      />
    </div>
  );
};

export default AdminDataStructures;