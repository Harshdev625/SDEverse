import React, { useEffect, useState, Fragment } from "react";
import { FaEye, FaTrash } from "react-icons/fa";
import {
  fetchAllContacts,
  deleteContact,
} from "../features/contact/contactAPI"; // 👈 your contact API
import Pagination from "./Pagination";

const AdminUsersContact = ({ themeMode }) => {
  const [contacts, setContacts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [input, setInput] = useState("");
  const [expandedContactId, setExpandedContactId] = useState(null);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(6);

  // Fetch all contacts from backend
  useEffect(() => {
    const getContacts = async () => {
      try {
        const data = await fetchAllContacts();
        setContacts(data);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };
    getContacts();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteContact(id);
      setContacts((prev) => prev.filter((contact) => contact._id !== id));
      toast.success("Contact deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete contact.");
    } finally {
      setIsModalOpen(false);
      setSelectedContact(null);
    }
  };

  // Filter contacts by search query
  const filteredContacts = contacts.filter((contact) =>
    [contact.firstName, contact.lastName, contact.email, contact.subject]
      .join(" ")
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
  const paginatedContacts = filteredContacts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Toggle expanded row
  const handleExpand = (id) => {
    setExpandedContactId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className={`max-w-7xl mx-auto px-4 py-10 ${
        themeMode === "dark" ? "text-white" : "text-gray-900"
      }`}
    >
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 dark:text-white transition-colors duration-300">
        Manage Users Contacts
      </h1>

      {/* Search Bar */}
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
          className={`flex-1 min-w-[200px] px-4 py-2 rounded-md border focus:ring-2 focus:border-gray-400 focus:ring-gray-300 ${
            themeMode === "dark"
              ? "bg-gray-800 border-gray-600 text-white focus:ring-gray-500"
              : "bg-white border-gray-300 text-gray-900"
          }`}
        />
        <button
          type="submit"
          className="bg-indigo-600 px-6 py-2 rounded-md font-semibold text-white hover:bg-indigo-700"
        >
          Search
        </button>
      </form>

      {/* Contact Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead
            className={themeMode === "dark" ? "bg-gray-800" : "bg-gray-100"}
          >
            <tr>
              <th
                className={`px-4 py-3 ${
                  themeMode === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Name
              </th>
              <th
                className={`px-4 py-3 ${
                  themeMode === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Email
              </th>
              <th
                className={`px-4 py-3 ${
                  themeMode === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Subject
              </th>
              <th
                className={`px-4 py-3 ${
                  themeMode === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Message
              </th>
              <th
                className={`px-4 py-3 ${
                  themeMode === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                View
              </th>
              <th
                className={`px-4 py-3 ${
                  themeMode === "dark" ? "text-white" : "text-gray-900"
                }`}
              >
                Delete
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedContacts.length > 0 ? (
              paginatedContacts.map((contact) => {
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
                      <td
                        className={`px-4 py-3 font-medium ${
                          themeMode === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {fullName}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          themeMode === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {contact.email}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          themeMode === "dark" ? "text-white" : "text-gray-900"
                        }`}
                      >
                        {contact.subject}
                      </td>
                      <td
                        className={`px-4 py-3 truncate max-w-[250px] ${
                          themeMode === "dark"
                            ? "text-gray-300"
                            : "text-gray-800"
                        }`}
                      >
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
                          onClick={() => {
                            setSelectedContact(contact);
                            setIsModalOpen(true);
                          }}
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
              })
            ) : (
              <tr>
                <td colSpan="5" className="text-center py-6">
                  No contact submissions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {isModalOpen && selectedContact && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/50 backdrop-blur-sm animate-fadeIn"
          onClick={() => setIsModalOpen(false)} // Close when clicking outside
        >
          <div
            onClick={(e) => e.stopPropagation()} // Prevent click inside modal from closing
            className={`relative w-[90%] max-w-sm p-6 rounded-2xl shadow-2xl transform transition-all duration-300 scale-100
        ${
          themeMode === "dark"
            ? "bg-gray-800 text-white"
            : "bg-white text-gray-900"
        }`}
          >
            {/* Close button (X) */}
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-200"
            >
              ✕
            </button>

            <div className="text-center">
              <div className="flex justify-center items-center w-16 h-16 mx-auto rounded-full bg-red-100 mb-4">
                <FaTrash className="text-red-600 text-2xl" />
              </div>

              <h2 className="text-xl font-semibold mb-3">Delete Contact?</h2>
              <p className="text-gray-400 mb-6">
                Are you sure you want to delete this message from{" "}
                <span className="font-semibold text-gray-400">
                  {selectedContact.firstName}
                </span>
                ?
              </p>

              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className={`px-5 py-2 rounded-lg font-medium transition
              ${
                themeMode === "dark"
                  ? "bg-gray-700 text-white hover:bg-gray-600"
                  : "bg-gray-200 text-gray-900 hover:bg-gray-300"
              }`}
                >
                  Cancel
                </button>

                <button
                  onClick={() => handleDelete(selectedContact._id)}
                  className="px-5 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
};

export default AdminUsersContact;
