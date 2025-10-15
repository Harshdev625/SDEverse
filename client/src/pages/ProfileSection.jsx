import React from 'react';

export default function ProfileSection({ isEditing, formData, handleChange }) {
  const renderField = (
    label,
    name,
    value,
    isEditing,
    handleChange,
    isUrl = false
  ) => {
    return (
      <div className="space-y-2">
        <label htmlFor={name} className="block font-medium text-gray-600 dark:text-gray-400 text-sm mb-1">
          {label}
        </label>
        {isEditing ? (
          <input
            type={isUrl ? "url" : "text"}
            id={name} // Added id for label association
            name={name}
            value={value}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 placeholder-gray-500 focus:ring-2 focus:ring-gray-300 dark:focus:ring-blue-500 focus:border-gray-400 dark:focus:border-blue-500 outline-none transition-all duration-200"
            placeholder={`Enter your ${label.toLowerCase()}`}
          />
        ) : isUrl && value ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-400 hover:text-emerald-300 hover:underline break-all text-lg pt-1 pb-1 inline-block w-full" // Removed box styling for non-editing state
          >
            {value}
          </a>
        ) : (
          <p className="text-gray-900 dark:text-white text-lg pt-1 pb-1 min-h-[44px] flex items-center"> {/* Removed box styling for non-editing state */}
            {value || <span className="italic text-gray-500 dark:text-gray-400">Not set</span>}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 sm:p-8 rounded-2xl shadow-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
        Profile Details
      </h3>

      <div className="space-y-8">
        <div className="flex flex-col items-center gap-6">
          {formData.avatarUrl ? (
            <img
              src={formData.avatarUrl}
              alt="Profile"
              className="w-40 h-40 object-cover rounded-full shadow-xl border-4 border-blue-500 transform hover:scale-105 transition-transform duration-300"
              onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/160x160/2d3748/cbd5e0?text=No+Image"; }}
            />
          ) : (
            <div className="w-40 h-40 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-300 shadow-xl border-4 border-gray-300 dark:border-gray-600">
              <span className="text-sm">No Image</span>
            </div>
          )}

          {isEditing && ( // Only show input when editing
            <div className="w-full max-w-lg"> {/* Added wrapper for max-w */}
              <label htmlFor="avatarUrl" className="sr-only">Avatar URL</label> {/*sr-only for accessibility*/}
              <input
                type="text"
                id="avatarUrl"
                name="avatarUrl"
                value={formData.avatarUrl}
                onChange={handleChange}
                placeholder="Avatar URL"
                className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 placeholder-gray-500 focus:ring-2 focus:ring-gray-300 dark:focus:ring-blue-500 focus:border-gray-400 dark:focus:border-blue-500 outline-none transition-all duration-200"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {renderField(
            "Full Name",
            "fullName",
            formData.fullName,
            isEditing,
            handleChange
          )}
          {renderField(
            "Location",
            "location",
            formData.location,
            isEditing,
            handleChange
          )}
        </div>

        <div> {/* Bio field spans full width */}
          <label htmlFor="bio" className="block font-medium text-gray-600 dark:text-gray-400 text-sm mb-1">
            Bio
          </label>
          {isEditing ? (
            <textarea
              id="bio"
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-gray-300 dark:focus:ring-blue-500 focus:border-gray-400 dark:focus:border-blue-500 outline-none transition-all duration-200 resize-y"
              placeholder="Write something about yourself"
            ></textarea>
          ) : (
            <p className="text-gray-900 dark:text-white text-lg pt-1 pb-1 min-h-[100px] whitespace-pre-wrap"> {/* Removed box styling for non-editing state */}
              {formData.bio || <span className="italic text-gray-500 dark:text-gray-400">No bio provided</span>}
            </p>
          )}
        </div>

        <div> {/* Website field spans full width */}
          {renderField(
            "Website",
            "website",
            formData.website,
            isEditing,
            handleChange,
            true
          )}
        </div>
      </div>
    </div>
  );
}