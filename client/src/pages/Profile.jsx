import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import {
  getMyProfile,
  getUserByUsername,
  patchMyProfile,
  refreshSocialStats,
  refreshCompetitiveStats,
} from "../features/user/userSlice";
import { Facebook, Instagram, Loader2 } from "lucide-react";
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
  const [imagePreview, setImagePreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [uploadedImageBase64, setUploadedImageBase64] = useState(null);

  const [uploadedBannerBase64, setUploadedBannerBase64] = useState(null);

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

  useEffect(() => {
    if (username) {
      // Viewing another user's profile
      dispatch(getUserByUsername(username));
    } else {
      // Viewing own profile
      dispatch(getMyProfile());
    }
  }, [dispatch, username]);

  useEffect(() => {
    const profileData = username ? selectedUser : myProfile;
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
      });
      setLastRefreshed({
        competitive: profileData.lastCompetitiveRefresh || null,
        social: profileData.lastSocialRefresh || null,
      });
      setHasChanges(false);
      setUrlErrors({});
    }
  }, [myProfile, selectedUser, username]);

  const isValidUrl = (val) => {
    if (!val) return true;
    const trimmedVal = val.trim();

    try {
      const url = new URL(
        trimmedVal.startsWith("http") ? trimmedVal : `https://${trimmedVal}`
      );
      return !!url.hostname && url.hostname.includes(".");
    } catch (e) {
      return false;
    }
  };

  const validateAndSetError = (name, value) => {
    let errorMsg = null;
    const trimmedValue = value ? value.trim() : "";

    if (trimmedValue && !isValidUrl(trimmedValue)) {
      errorMsg =
        "Please enter a valid URL structure (e.g., https://example.com or example.com).";
    }

    if (
      !errorMsg &&
      trimmedValue &&
      (name.startsWith("socialLinks.") ||
        name.startsWith("competitiveProfiles."))
    ) {
      const parts = name.split(".");
      if (parts.length === 2) {
        const platform = parts[1];
        const requiredDomain = PLATFORM_DOMAINS[platform];

        if (requiredDomain) {
          try {
            const url = new URL(
              trimmedValue.startsWith("http")
                ? trimmedValue
                : `https://${trimmedValue}`
            );

            if (!url.hostname.endsWith(requiredDomain)) {
              errorMsg = `This link must be a valid ${formatKey(
                platform
              )} profile URL (must contain ${requiredDomain}).`;
            }
          } catch (e) {
            errorMsg = "Invalid URL structure.";
          }
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
    const { name, value } = e.target;
    setHasChanges(true);

    const isUrlField =
      name === "avatarUrl" ||
      name === "website" ||
      name === "bannerUrl" ||
      name.startsWith("socialLinks.") ||
      name.startsWith("competitiveProfiles.");

    const newValue = value;

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
        errors[k] =
          "Please enter a valid URL structure (e.g., https://example.com).";
        return;
      }

      if (
        k.startsWith("socialLinks.") ||
        k.startsWith("competitiveProfiles.")
      ) {
        const platform = k.split(".")[1];
        const requiredDomain = PLATFORM_DOMAINS[platform];

        if (requiredDomain) {
          try {
            const url = new URL(
              trimmedValue.startsWith("http")
                ? trimmedValue
                : `https://${trimmedValue}`
            );
            if (!url.hostname.endsWith(requiredDomain)) {
              errors[k] = `The link must be a valid ${formatKey(
                platform
              )} profile URL (must contain ${requiredDomain}).`;
            }
          } catch (e) {
            errors[k] = "Invalid URL format.";
          }
        }
      }
    };

    check("avatarUrl", data.avatarUrl);
    check("website", data.website);

    if (data.socialLinks) {
      Object.entries(data.socialLinks).forEach(([key, val]) =>
        check(`socialLinks.${key}`, val)
      );
    }
    if (data.competitiveProfiles) {
      Object.entries(data.competitiveProfiles).forEach(([key, val]) =>
        check(`competitiveProfiles.${key}`, val)
      );
    }

    return errors;
  };

  const getAvatarValue = () => {
    return uploadedImageBase64 || formData.avatarUrl;
  };
  const getBannerValue = () => {
    return uploadedBannerBase64 || formData.bannerUrl;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const avatarValue = getAvatarValue();
    const bannerValue = getBannerValue();

    const validationErrors = validateAllUrlsBeforeSubmit(formData);
    if (Object.keys(validationErrors).length > 0) {
      setUrlErrors(validationErrors);

      return;
    }

    const dataToSubmit = {
      ...formData,
      avatarUrl: avatarValue,
      bannerUrl: bannerValue,
    };

    if (dataToSubmit.avatarUrl && !dataToSubmit.avatarUrl.startsWith("data:")) {
      dataToSubmit.avatarUrl = ensureProtocol(dataToSubmit.avatarUrl);
    }
    if (dataToSubmit.bannerUrl && !dataToSubmit.bannerUrl.startsWith("data:")) {
      dataToSubmit.bannerUrl = ensureProtocol(dataToSubmit.bannerUrl);
    }

    dataToSubmit.website = ensureProtocol(dataToSubmit.website);

    if (dataToSubmit.socialLinks) {
      dataToSubmit.socialLinks = Object.fromEntries(
        Object.entries(dataToSubmit.socialLinks).map(([key, val]) => [
          key,
          ensureProtocol(val),
        ])
      );
    }
    if (dataToSubmit.competitiveProfiles) {
      dataToSubmit.competitiveProfiles = Object.fromEntries(
        Object.entries(dataToSubmit.competitiveProfiles).map(([key, val]) => [
          key,
          ensureProtocol(val),
        ])
      );
    }

    await dispatch(patchMyProfile(dataToSubmit));
    await dispatch(getMyProfile());

    setIsEditing(false);
    setHasChanges(false);
    setUrlErrors({});

    setImagePreview(null);
    setBannerPreview(null);
    setUploadedImageBase64(null);
    setUploadedBannerBase64(null);
  };

  const handleCancel = () => {
    if (myProfile) {
      setFormData({
        fullName: myProfile.fullName || "",
        bio: myProfile.bio || "",
        avatarUrl: myProfile.avatarUrl || "",
        bannerUrl: myProfile.bannerUrl || "",
        location: myProfile.location || "",
        website: myProfile.website || "",
        socialLinks: myProfile.socialLinks || {},
        competitiveProfiles: myProfile.competitiveProfiles || {},
        socialStats: myProfile.socialStats || {},
        competitiveStats: myProfile.competitiveStats || {},
      });
    }
    setImagePreview(null);
    setBannerPreview(null);
    setIsEditing(false);
    setHasChanges(false);
    setUrlErrors({});
  };

  const handleRefresh = async (type) => {
    setRefreshing({ type });
    try {
      if (type === "competitive") {
        await dispatch(refreshCompetitiveStats());
      } else {
        await dispatch(refreshSocialStats());
      }

      await dispatch(getMyProfile());
    } finally {
      setRefreshing({ type: null });
    }
  };

  const isLoading = status.fetchProfile === "loading" || status.fetchSelectedUser === "loading";
  const isViewingOtherUser = !!username;
  
  if (isLoading || !formData) {
    return (
      <div
        className={`flex items-center justify-center min-h-screen ${
          themeMode === "dark"
            ? "bg-gray-950 text-gray-200"
            : "bg-gray-50 text-gray-800"
        }`}
      >
        <Loader2 className="animate-spin text-blue-500 mr-3" size={48} />
        <p className="text-xl font-semibold">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${
        themeMode === "dark"
          ? "bg-gray-950 text-gray-100"
          : "bg-gray-50 text-gray-900"
      }`}
    >
      <ProfileForm
        formData={formData}
        isEditing={isEditing && !isViewingOtherUser}
        hasChanges={hasChanges}
        refreshing={refreshing}
        lastRefreshed={lastRefreshed}
        urlErrors={urlErrors}
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onEditToggle={() => !isViewingOtherUser && setIsEditing(!isEditing)}
        onRefresh={handleRefresh}
        imageData={imageData}
        readonly={isViewingOtherUser}
      />
    </div>
  );
}