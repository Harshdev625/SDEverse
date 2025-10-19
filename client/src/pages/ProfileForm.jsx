import { Pencil, Bookmark } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ProfileSection from "./ProfileSection";
import LinksSection from "./LinksSection";

export default function ProfileForm({
  formData,
  isEditing,
  hasChanges,
  refreshing,
  lastRefreshed,
  onChange,
  onSubmit,
  onCancel,
  onEditToggle,
  onRefresh,
  readonly = false,
}) {
  const navigate = useNavigate();
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 rounded-2xl shadow-xl p-6 sm:p-8 lg:p-12 border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 overflow-visible">
      {/* Header */}
      {!readonly && (
        <div className="flex flex-col sm:flex-row justify-between items-center gap-6 pt-4 pb-8 border-b border-gray-200 dark:border-gray-700 overflow-visible">
          <div className="flex flex-col items-center sm:items-start">
            <h1 className="relative z-10 mt-1 mb-2 leading-tight text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500 drop-shadow-lg text-center sm:text-left">
              My Profile
            </h1>
            
            {/* Bookmarks Link */}
            <button
              onClick={() => navigate('/bookmarks')}
              className="flex items-center gap-2 px-4 py-2 mt-3 bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-400 rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Bookmark size={18} />
              <span className="font-medium">My Bookmarks</span>
            </button>
          </div>

          {!isEditing ? (
            <button
              onClick={onEditToggle}
              className="flex items-center gap-3 px-7 py-3 bg-gradient-to-r from-emerald-500 to-green-600 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 ease-in-out text-lg"
            >
              <Pencil size={22} />
              Edit Profile
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <button
                onClick={onCancel}
                className="px-7 py-3 font-medium rounded-full border text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300 ease-in-out shadow-md text-lg"
              >
                Cancel
              </button>
              <button
                onClick={onSubmit}
                disabled={!hasChanges}
                className={`px-7 py-3 font-semibold rounded-full transition-all duration-300 ease-in-out shadow-md text-lg ${
                  hasChanges
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 hover:shadow-lg transform hover:scale-105"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed opacity-70"
                }`}
              >
                Save Changes
              </button>
            </div>
          )}
        </div>
      )}

      {/* Profile Details */}
      <section className="space-y-8">
        <ProfileSection
          isEditing={isEditing && !readonly}
          formData={formData}
          handleChange={onChange}
        />
      </section>

      {/* Competitive Links */}
      <section className="space-y-8">
        <LinksSection
          title="Competitive Links"
          links={formData.competitiveProfiles}
          stats={formData.competitiveStats}
          isEditing={isEditing && !readonly}
          readonly={readonly}
          handleChange={onChange}
          refreshing={refreshing.type === "competitive"}
          onRefresh={() => onRefresh("competitive")}
          lastUpdated={lastRefreshed.competitive}
        />
      </section>

      {/* Social Links */}
      <section className="space-y-8">
        <LinksSection
          title="Social Links"
          links={formData.socialLinks}
          stats={formData.socialStats}
          isEditing={isEditing && !readonly}
          readonly={readonly}
          handleChange={onChange}
          refreshing={refreshing.type === "social"}
          onRefresh={() => onRefresh("social")}
          lastUpdated={lastRefreshed.social}
        />
      </section>
    </div>
  );
}