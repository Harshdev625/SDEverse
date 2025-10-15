import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyProfile,
  patchMyProfile,
  refreshSocialStats,
  refreshCompetitiveStats,
} from "../features/user/userSlice";
import { Loader2 } from "lucide-react";
import ProfileForm from "./ProfileForm";

export default function Profile() {
  const dispatch = useDispatch();
  const { myProfile, status } = useSelector((state) => state.user);
  const themeMode = useSelector((state) => state.theme.mode);

  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [refreshing, setRefreshing] = useState({ type: null });
  const [lastRefreshed, setLastRefreshed] = useState({
    competitive: null,
    social: null,
  });

  useEffect(() => {
    dispatch(getMyProfile());
  }, [dispatch]);

  useEffect(() => {
    if (myProfile) {
      setFormData({
        fullName: myProfile.fullName || "",
        bio: myProfile.bio || "",
        avatarUrl: myProfile.avatarUrl || "",
        location: myProfile.location || "",
        website: myProfile.website || "",
        socialLinks: myProfile.socialLinks || {},
        competitiveProfiles: myProfile.competitiveProfiles || {},
        socialStats: myProfile.socialStats || {},
        competitiveStats: myProfile.competitiveStats || {},
      });
      setLastRefreshed({
        competitive: myProfile.lastCompetitiveRefresh || null,
        social: myProfile.lastSocialRefresh || null,
      });
      setHasChanges(false);
    }
  }, [myProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHasChanges(true);
    if (name.includes(".")) {
      const [section, key] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(patchMyProfile(formData));
    await dispatch(getMyProfile()); // Refresh profile to get updated data and timestamps
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleCancel = () => {
    if (myProfile) {
      setFormData({
        fullName: myProfile.fullName || "",
        bio: myProfile.bio || "",
        avatarUrl: myProfile.avatarUrl || "",
        location: myProfile.location || "",
        website: myProfile.website || "",
        socialLinks: myProfile.socialLinks || {},
        competitiveProfiles: myProfile.competitiveProfiles || {},
        socialStats: myProfile.socialStats || {},
        competitiveStats: myProfile.competitiveStats || {},
      });
    }
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleRefresh = async (type) => {
    setRefreshing({ type });
    try {
      if (type === "competitive") {
        await dispatch(refreshCompetitiveStats());
      } else {
        await dispatch(refreshSocialStats());
      }
      // Re-fetch profile to get the latest stats and refresh timestamps
      await dispatch(getMyProfile());
    } finally {
      setRefreshing({ type: null });
    }
  };

  if (status === "loading" || !formData) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${themeMode === 'dark' ? 'bg-gray-950 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
        <Loader2 className="animate-spin text-blue-500 mr-3" size={48} />
        <p className="text-xl font-semibold">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${themeMode === 'dark' ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <ProfileForm
        formData={formData}
        isEditing={isEditing}
        hasChanges={hasChanges}
        refreshing={refreshing}
        lastRefreshed={lastRefreshed}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onEditToggle={() => setIsEditing(!isEditing)}
        onRefresh={handleRefresh}
      />
    </div>
  );
}