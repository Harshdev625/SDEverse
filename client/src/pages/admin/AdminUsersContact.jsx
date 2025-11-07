import React, { useEffect, useState, Fragment } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getContactList,
  removeContact,
} from "../../features/contact/contactSlice";
import { FaEye, FaTrash } from "react-icons/fa";
import { Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import Pagination from "../shared/Pagination";

const AdminUsersContact = () => {
  const dispatch = useDispatch();
  const {
    contactList = [],
    totalPages = 1,
    loading,
    error,
  } = useSelector((state) => state.contact);
  const themeMode = useSelector((state) => state.theme.mode);

  const [input, setInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedContactId, setExpandedContactId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState(null);

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

  const handleDelete = (id) => {
    setSelectedContactId(id);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedContactId) return;
    try {
      await dispatch(removeContact(selectedContactId)).unwrap();
      toast.success("Contact deleted successfully!");
      setConfirmOpen(false);
      setSelectedContactId(null);
      dispatch(
        getContactList({
          search: searchQuery || undefined,
          page: currentPage,
          limit: 5,
        })
      );
    } catch (err) {
      toast.error(`Failed to delete contact: ${err.message || err}`);
    }
  };

  const handleExpand = (id) => {
    setExpandedContactId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className={`max-w-7xl mx-auto px-4 py-10 ${
        themeMode === "dark" ? "text-white" : "text-gray-900"
      }`}
    >
      <div className="text-center mb-6">
        <h1
          className={`text-4xl font-extrabold mb-2 ${
            themeMode === "dark" ? "text-white" : "text-gray-900"
          }`}
        >
          Manage User Contacts
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          View and moderate messages sent by users — total: {contactList.length}
        </p>
      </div>

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

      {loading && (
        <p className="text-center text-gray-500 dark:text-gray-400">
          Loading contacts...
        </p>
      )}
      {error && (
        <p className="text-center text-red-500 dark:text-red-400">{error}</p>
      )}

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
                          className={`inline-flex items-center justify-center p-1 rounded ${
                            confirmOpen && selectedContactId === contact._id
                              ? "bg-red-100 text-red-700 ring-2 ring-red-300"
                              : "hover:text-red-500"
                          }`}
                        >
                          <FaTrash className="text-lg" />
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setConfirmOpen(false)}
          />

          <div className="relative w-full max-w-2xl mx-auto pointer-events-auto">
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
              <div className="p-6 flex gap-4 items-start">
                <div className="flex-shrink-0 mt-1">
                  <div className="h-10 w-10 flex items-center justify-center rounded-full bg-red-50 relative">
                    <Trash2
                      className="absolute inset-0 m-auto text-red-600"
                      size={20}
                    />
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Delete contact?
                      </h3>
                      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                        This action will permanently delete the message. This
                        cannot be undone.
                      </p>
                    </div>
                    <div className="sm:hidden" />
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 pt-2 flex items-center justify-between">
                <button
                  onClick={() => setConfirmOpen(false)}
                  className="px-4 py-2 rounded-md bg-gray-100 dark:bg-gray-800 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-200"
                >
                  Cancel
                </button>

                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 rounded-md bg-red-600 text-sm text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersContact;
