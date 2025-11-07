import { User, BarChart2, BookMarked, StickyNote, Archive } from "lucide-react";
import { motion as Motion } from "framer-motion";
import ProfileSection from "./ProfileSection";
import LinksSection from "./LinksSection";
import NotesPanel from "../../components/panels/NotesPanel";
import BookmarksPanel from "../../components/panels/BookmarksPanel";
import StorePanel from "../../components/panels/StorePanel";

const TabButton = ({ label, icon, isActive, onClick }) => {
  return (
    <Motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative flex items-center gap-2 px-8 py-4 font-medium transition-all duration-200 flex-1 sm:flex-none ${
          isActive
            ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400"
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 border-b-2 border-transparent hover:border-gray-300 dark:hover:border-gray-600"
        }`}
    >
      <span>{icon}</span>
      <span className="hidden sm:inline">{label}</span>
    </Motion.button>
  );
};

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
  urlErrors,
  onRefresh,
  imageData,
  readonly = false,
  actionError = null,
  activeTab,
  onTabChange,
}) {
  return (
    <div className="w-full max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <Motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sticky top-0 z-30 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-sm"
      >
        <div className="flex">
          <TabButton
            label="Profile"
            icon={<User size={20} />}
            isActive={activeTab === "profile"}
            onClick={() => onTabChange("profile")}
          />
          <TabButton
            label="Stats"
            icon={<BarChart2 size={20} />}
            isActive={activeTab === "stats"}
            onClick={() => onTabChange("stats")}
          />
          <TabButton
            label="Bookmarks"
            icon={<BookMarked size={20} />}
            isActive={activeTab === "bookmarks"}
            onClick={() => onTabChange("bookmarks")}
          />
          <TabButton
            label="Store"
            icon={<Archive size={20} />}
            isActive={activeTab === "store"}
            onClick={() => onTabChange("store")}
          />
          <TabButton
            label="Notes"
            icon={<StickyNote size={20} />}
            isActive={activeTab === "notes"}
            onClick={() => onTabChange("notes")}
          />
        </div>
      </Motion.div>
      
      {actionError && (
        <Motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full rounded-xl bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 p-4 text-red-700 dark:text-red-300"
        >
          <strong className="block font-semibold text-base mb-1">⚠️ Error</strong>
          <p className="text-sm">{actionError}</p>
        </Motion.div>
      )}

      <Motion.div 
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="flex-1"
      >
        {activeTab === "profile" && (
          <ProfileSection
            formData={formData}
            isEditing={isEditing}
            hasChanges={hasChanges}
            onChange={onChange}
            onSubmit={onSubmit}
            onCancel={onCancel}
            onEditToggle={onEditToggle}
            urlErrors={urlErrors}
            imageData={imageData}
            readonly={readonly}
          />
        )}

        {activeTab === "stats" && (
          <div className="space-y-6">
            <LinksSection
              title="Competitive Stats"
              links={formData.competitiveProfiles}
              stats={formData.competitiveStats}
              readonly={readonly}
              handleChange={onChange}
              urlErrors={urlErrors}
              refreshing={refreshing.type === "competitive"}
              onRefresh={() => onRefresh("competitive")}
              lastUpdated={lastRefreshed.competitive}
            />
            <LinksSection
              title="Social Stats"
              links={formData.socialLinks}
              stats={formData.socialStats}
              readonly={readonly}
              handleChange={onChange}
              urlErrors={urlErrors}
              refreshing={refreshing.type === "social"}
              onRefresh={() => onRefresh("social")}
              lastUpdated={lastRefreshed.social}
            />
          </div>
        )}

        {activeTab === "bookmarks" && (
          <BookmarksPanel />
        )}
        
              {activeTab === "store" && (
                <StorePanel />
              )}

              {activeTab === "notes" && (
          <NotesPanel />
        )}
      </Motion.div>
    </div>
  );
}