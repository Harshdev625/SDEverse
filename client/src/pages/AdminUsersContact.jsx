import React, { useEffect, useState, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getContactList, removeContact } from "../features/contact/contactSlice";
import { FaEye, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import Pagination from "./Pagination";

const AdminUsersContact = () => {
  const dispatch = useDispatch();
  const { contactList = [], totalPages = 1, loading, error } = useSelector(
    (state) => state.contact
  );
  const themeMode = useSelector((state) => state.theme.mode);

  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedContactId, setExpandedContactId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  // 🔹 Fetch contacts when page changes
  useEffect(() => {
    dispatch(
      getContactList({
        search: searchQuery || undefined,
        page: currentPage,
        limit: 5,
      })
    );
  }, [dispatch, currentPage, searchQuery]);

  const filteredContacts = contactList.filter((contact) =>
    [contact.firstName, contact.lastName, contact.email, contact.subject]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // 🔹 Delete contact directly (no modal)
  const handleDelete = async (id) => {
    try {
      await dispatch(removeContact(id)).unwrap();
      toast.success("Contact deleted successfully!");
    } catch (err) {
      toast.error(`Failed to delete contact: ${err.message || err}`);
    }
  };

  // 🔹 Toggle expanded message
  const handleExpand = (id) => {
    setExpandedContactId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className={`max-w-7xl mx-auto px-4 py-10 ${
        themeMode === "dark" ? "text-white" : "text-gray-900"
      }`}
    >
      <h1
        className={`text-4xl font-bold text-center mb-8 ${
          themeMode === "dark" ? "text-white" : "text-gray-900"
        }`}
      >
        Manage Users Contacts
      </h1>

      {/* 🔹 Search Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setSearchQuery(input);
          setCurrentPage(1);
        }}
        className="flex flex-wrap md:flex-nowrap items-center gap-3 mb-6"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Search by name, email, or subject"
          className={`flex-1 min-w-[200px] px-4 py-2 rounded border focus:ring-2 focus:border-gray-400 focus:ring-gray-300 ${
            themeMode === "dark"
              ? "bg-gray-800 border-gray-600 text-white focus:ring-gray-500"
              : "bg-white border-gray-300 text-gray-900"
          }`}
        />
        <button
          type="submit"
          className="bg-indigo-600 px-6 py-2 rounded font-semibold text-white hover:bg-indigo-700"
        >
          Search
        </button>
      </form>

      {/* 🔹 Loading & Error States */}
      {loading && (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Loading contacts...
        </p>
      )}
      {error && (
        <p className="text-center text-red-500 dark:text-red-400">{error}</p>
      )}

      {/* 🔹 Contacts Table */}
      {!loading && filteredContacts.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead
              className={themeMode === "dark" ? "bg-gray-800" : "bg-gray-100"}
            >
              <tr>
                {["Name", "Email", "Subject", "Message", "View", "Delete"].map(
                  (head) => (
                    <th
                      key={head}
                      className={`px-4 py-3 ${
                        themeMode === "dark" ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {head}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {filteredContacts.map((contact) => {
                const isExpanded = expandedContactId === contact._id;
                const fullName = `${contact.firstName} ${contact.lastName}`;

                return (
                  <Fragment key={contact._id}>
                    <tr
                      className={`border-b ${
                        themeMode === "dark"
                          ? "bg-gray-900 border-gray-700"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <td className="px-4 py-3 font-medium">{fullName}</td>
                      <td className="px-4 py-3">{contact.email}</td>
                      <td className="px-4 py-3">{contact.subject}</td>
                      <td className="px-4 py-3 truncate max-w-[250px]">
                        {contact.message}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleExpand(contact._id)}
                          title="View Full Message"
                        >
                          <FaEye className="inline text-lg hover:text-blue-400" />
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleDelete(contact._id)}
                          title="Delete Contact"
                        >
                          <FaTrash className="text-lg hover:text-red-500" />
                        </button>
                      </td>
                    </tr>

                    {isExpanded && (
                      <tr
                        className={`${
                          themeMode === "dark" ? "bg-gray-800" : "bg-gray-50"
                        }`}
                      >
                        <td colSpan="6" className="px-4 py-6">
                          <div className="space-y-2">
                            <p>
                              <strong>Full Name:</strong> {fullName}
                            </p>
                            <p>
                              <strong>Email:</strong> {contact.email}
                            </p>
                            <p>
                              <strong>Subject:</strong> {contact.subject}
                            </p>
                            <p>
                              <strong>Message:</strong>
                              <br />
                              <span className="block mt-1 whitespace-pre-wrap">
                                {contact.message}
                              </span>
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        !loading && (
          <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
            No contact submissions found.
          </p>
        )
      )}

      {/* 🔹 Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default AdminUsersContact;
