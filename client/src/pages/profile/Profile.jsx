import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  getMyProfile,
  getUserByUsername,
  patchMyProfile,
  refreshSocialStats,
  refreshCompetitiveStats,
} from "../../features/user/userSlice";
import { Loader2 } from "lucide-react";
import ProfileForm from "./ProfileForm";

function formatKey(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/_/g, " ");
}

const PLATFORM_DOMAINS = {
  github: "github.com",
  linkedin: "linkedin.com",
  twitter: "twitter.com",
  facebook: "facebook.com",
  instagram: "instagram.com",
  leetcode: "leetcode.com",
  codechef: "codechef.com",
  codeforces: "codeforces.com",
  atcoder: "atcoder.jp",
  spoj: "spoj.com",
};

const ensureProtocol = (url) => {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export default function Profile() {
  const dispatch = useDispatch();
  const { username } = useParams();
  const { myProfile, selectedUser, status } = useSelector((state) => state.user);
  const authUser = useSelector((state) => state.auth.user);
  const themeMode = useSelector((state) => state.theme.mode);

  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [refreshing, setRefreshing] = useState({ type: null });
  const [lastRefreshed, setLastRefreshed] = useState({
    competitive: null,
    social: null,
  });

  const [urlErrors, setUrlErrors] = useState({});
  const [actionError, setActionError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [uploadedImageBase64, setUploadedImageBase64] = useState(null);
  const [uploadedBannerBase64, setUploadedBannerBase64] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");

  const imageData = {
    imagePreview,
    setImagePreview,
    uploadedImageBase64,
    setUploadedImageBase64,
    bannerPreview,
    setBannerPreview,
    uploadedBannerBase64,
    setUploadedBannerBase64,
  };

  // Helper function to initialize form state
  const initializeFormData = (profileData) => {
    if (profileData) {
      setFormData({
        fullName: profileData.fullName || "",
        bio: profileData.bio || "",
        avatarUrl: profileData.avatarUrl || "",
        bannerUrl: profileData.bannerUrl || "",
        location: profileData.location || "",
        website: profileData.website || "",
        socialLinks: profileData.socialLinks || {},
        competitiveProfiles: profileData.competitiveProfiles || {},
        socialStats: profileData.socialStats || {},
        competitiveStats: profileData.competitiveStats || {},
        projects: profileData.projects || [],
        experiences: profileData.experiences || [],
      });
      setLastRefreshed({
        competitive: profileData.lastCompetitiveRefresh || null,
        social: profileData.lastSocialRefresh || null,
      });
      setHasChanges(false);
      setUrlErrors({});
    }
  };

  useEffect(() => {
    if (username) {
      if (authUser && authUser.username === username) {
        dispatch(getMyProfile());
      } else {
        dispatch(getUserByUsername(username));
      }
    } else {
      dispatch(getMyProfile());
    }
  }, [dispatch, username, authUser]);


  // *** THIS IS THE FIX ***
  // The useEffect that initializes the form should ONLY depend on the source data.
  // It should NOT depend on `formData` itself.
  useEffect(() => {
    const isViewingOtherUser = username && !(authUser && authUser.username === username);
    const profileData = isViewingOtherUser ? selectedUser : myProfile;
    initializeFormData(profileData);
  }, [myProfile, selectedUser, username, authUser]); // <-- Dependency array fixed

  const isValidUrl = (val) => {
    if (!val) return true;
    const trimmedVal = val.trim();
    try {
      const url = new URL(
        trimmedVal.startsWith("http") ? trimmedVal : `https://${trimmedVal}`
      );
      return !!url.hostname && url.hostname.includes(".");
    } catch {
      return false;
    }
  };

  const validateAndSetError = (name, value) => {
    let errorMsg = null;
    const trimmedValue = value ? value.trim() : "";

    if (trimmedValue && !isValidUrl(trimmedValue)) {
      errorMsg = "Please enter a valid URL structure (e.g., https://example.com).";
    } else if (
      trimmedValue &&
      (name.startsWith("socialLinks.") || name.startsWith("competitiveProfiles."))
    ) {
      const platform = name.split(".")[1];
      const requiredDomain = PLATFORM_DOMAINS[platform];
      if (requiredDomain) {
        try {
          const url = new URL(
            trimmedValue.startsWith("http") ? trimmedValue : `https://${trimmedValue}`
          );
          if (!url.hostname.endsWith(requiredDomain)) {
            errorMsg = `URL must be a valid ${formatKey(platform)} profile (e.g., ${requiredDomain}).`;
          }
        } catch {
          errorMsg = "Invalid URL structure.";
        }
      }
    }

    setUrlErrors((prev) => {
      const next = { ...prev };
      if (errorMsg) next[name] = errorMsg;
      else delete next[name];
      return next;
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setHasChanges(true);

    const newValue = type === "checkbox" ? checked : value;

    if (name.includes(".")) {
      const [section, key] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: newValue,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: newValue }));
    }

    const isUrlField =
      name === "website" ||
      name.startsWith("socialLinks.") ||
      name.startsWith("competitiveProfiles.") ||
      (name.startsWith("projects[") && name.endsWith("].url"));
    if (isUrlField) {
      validateAndSetError(name, newValue);
    }
  };

  const validateAllUrlsBeforeSubmit = (data) => {
    const errors = {};
    const check = (k, v) => {
      const trimmedValue = v ? v.trim() : "";
      if (!trimmedValue) return;

      if (!isValidUrl(trimmedValue)) {
        errors[k] = "Please enter a valid URL structure (e.g., https://example.com).";
        return;
      }
      if (k.startsWith("socialLinks.") || k.startsWith("competitiveProfiles.")) {
        const platform = k.split(".")[1];
        const requiredDomain = PLATFORM_DOMAINS[platform];
        if (requiredDomain) {
          try {
            const url = new URL(
              trimmedValue.startsWith("http") ? trimmedValue : `https://${trimmedValue}`
            );
            if (!url.hostname.endsWith(requiredDomain)) {
              errors[k] = `URL must be a valid ${formatKey(platform)} profile.`;
            }
          } catch {
            errors[k] = "Invalid URL format.";
          }
        }
      }
    };

    check("website", data.website);
    if(data.socialLinks) {
      Object.entries(data.socialLinks).forEach(([k, v]) => check(`socialLinks.${k}`, v));
    }
    if(data.competitiveProfiles) {
      Object.entries(data.competitiveProfiles).forEach(([k, v]) => check(`competitiveProfiles.${k}`, v));
    }
    if (data.projects) {
      data.projects.forEach((p, i) => check(`projects[${i}].url`, p.url));
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateAllUrlsBeforeSubmit(formData);
    if (Object.keys(validationErrors).length > 0) {
      setUrlErrors(validationErrors);
      return;
    }

    const dataToSubmit = {
      ...formData,
      avatarUrl: uploadedImageBase64 || formData.avatarUrl,
      bannerUrl: uploadedBannerBase64 || formData.bannerUrl,
    };

    // Ensure all URLs have protocols
    const fieldsToProtocol = ["website"];
    fieldsToProtocol.forEach(field => {
      dataToSubmit[field] = ensureProtocol(dataToSubmit[field]);
    });
    ['socialLinks', 'competitiveProfiles'].forEach(section => {
      if (dataToSubmit[section]) {
        dataToSubmit[section] = Object.fromEntries(
          Object.entries(dataToSubmit[section]).map(([k, v]) => [k, ensureProtocol(v)])
        );
      }
    });
    if (dataToSubmit.projects) {
      dataToSubmit.projects = dataToSubmit.projects.map(p => ({ ...p, url: ensureProtocol(p.url) }));
    }

    try {
      setActionError(null);
      const res = await dispatch(patchMyProfile(dataToSubmit));
      if (res?.error) throw new Error(res.error?.message || res.payload || 'Update failed');
      
      const res2 = await dispatch(getMyProfile());
      if (res2?.error) throw new Error(res2.error?.message || res2.payload || 'Fetch profile failed');
      
      initializeFormData(res2.payload);
      
      setIsEditing(false);
      setHasChanges(false);
      setUrlErrors({});
      setImagePreview(null);
      setBannerPreview(null);
      setUploadedImageBase64(null);
      setUploadedBannerBase64(null);

    } catch (err) {
      setActionError(err.message || 'Failed to update profile');
    }
  };

  const handleCancel = () => {
    initializeFormData(myProfile);
    setIsEditing(false);
    setHasChanges(false);
    setUrlErrors({});
    setImagePreview(null);
    setBannerPreview(null);
    setUploadedImageBase64(null);
    setUploadedBannerBase64(null);
  };

  const handleRefresh = async (type) => {
    setRefreshing({ type });
    try {
      setActionError(null);
      const thunk = type === "competitive" ? refreshCompetitiveStats() : refreshSocialStats();
      const res = await dispatch(thunk);
      if (res?.error) throw new Error(res.error?.message || res.payload || 'Refresh failed');
      
      const res2 = await dispatch(getMyProfile()); // Refetch profile
      if (res2?.error) throw new Error(res2.error?.message || res2.payload || 'Fetch profile failed');
      
      initializeFormData(res2.payload); 
      
    } catch (err) {
        setActionError(err.message || 'Failed to refresh stats');
    } finally {
      setRefreshing({ type: null });
    }
  };

  const isLoading = status.fetchProfile === "loading" || status.fetchSelectedUser === "loading";
  const isViewingOtherUser = username && !(authUser && authUser.username === username);

  if (isLoading || !formData) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${
          themeMode === "dark" ? "bg-gray-950 text-gray-200" : "bg-gray-50 text-gray-800"
        }`}
      >
        <Loader2 className="animate-spin text-blue-500 mr-3" size={48} />
        <p className="text-xl font-semibold">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen w-full ${
        themeMode === "dark" 
          ? "bg-gray-950 text-gray-100" 
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <ProfileForm
        formData={formData}
        imageData={imageData}
        refreshing={refreshing}
        lastRefreshed={lastRefreshed}
        actionError={actionError}
        urlErrors={urlErrors}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isEditing={isEditing}
        hasChanges={hasChanges}
        readonly={isViewingOtherUser}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onEditToggle={() => setIsEditing(!isEditing)}
        onRefresh={handleRefresh}
      />
    </div>
  );
}