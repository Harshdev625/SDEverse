import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyProfile,
  patchMyProfile,
  refreshSocialStats,
  refreshCompetitiveStats,
} from "../features/user/userSlice";
import { Facebook, Instagram, Loader2 } from "lucide-react";
import ProfileForm from "./ProfileForm";

// Utility to format keys for display in error messages (copied from LinksSection)
function formatKey(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/_/g, " ");
}

// Map of known platform keys to their required domain for platform validation
const PLATFORM_DOMAINS = {
  // Social Links
  github: "github.com",
  linkedin: "linkedin.com",
  twitter: "twitter.com",
  facebook: "facebook.com",
  instagram: "instagram.com",
  // Competitive Profiles
  leetcode: "leetcode.com",
  codechef: "codechef.com",
  codeforces: "codeforces.com",
  atcoder: "atcoder.jp",
  spoj: "spoj.com",
};

// New Utility function to ensure a URL has a protocol for the backend
const ensureProtocol = (url) => {
  if (!url) return "";
  const trimmed = url.trim();
  // Only prepend if it doesn't already start with a protocol
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  // Assume https:// is intended and prepend it
  return `https://${trimmed}`;
};

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

  // central url error map, keys match input "name" attributes used in form:
  // e.g. "website", "avatarUrl", "socialLinks.github", "competitiveProfiles.leetcode"
  const [urlErrors, setUrlErrors] = useState({});

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
      setUrlErrors({});
    }
  }, [myProfile]);

  // Utility to check valid URL structure (more robust than regex alone)
  const isValidUrl = (val) => {
    if (!val) return true;
    const trimmedVal = val.trim();

    try {
      // Validation check: Prepend https:// internally if no protocol is present for the URL constructor to work
      const url = new URL(
        trimmedVal.startsWith("http") ? trimmedVal : `https://${trimmedVal}`
      );
      // Ensure the hostname is present and not just 'localhost' or an IP if we want public URLs
      return !!url.hostname && url.hostname.includes(".");
    } catch (e) {
      return false;
    }
  };

  const validateAndSetError = (name, value) => {
    let errorMsg = null;
    const trimmedValue = value ? value.trim() : "";

    // 1. General URL structure check
    // NOTE: This check works because isValidUrl handles the missing protocol internally.
    if (trimmedValue && !isValidUrl(trimmedValue)) {
      errorMsg =
        "Please enter a valid URL structure (e.g., https://example.com or example.com).";
    }

    // 2. Platform-specific domain check for social/competitive links
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
            // Again, use the protocol-fix logic for internal validation
            const url = new URL(
              trimmedValue.startsWith("http")
                ? trimmedValue
                : `https://${trimmedValue}`
            );
            // Check if the hostname ends with the required domain (to handle subdomains like www.leetcode.com)
            if (!url.hostname.endsWith(requiredDomain)) {
              errorMsg = `This link must be a valid ${formatKey(
                platform
              )} profile URL (must contain ${requiredDomain}).`;
            }
          } catch (e) {
            // Should be caught by isValidUrl, but catch just in case.
            errorMsg = "Invalid URL structure.";
          }
        }
      }
    }

    // update urlErrors entry for `name`
    setUrlErrors((prev) => {
      const next = { ...prev };
      if (errorMsg) next[name] = errorMsg;
      else delete next[name];
      return next;
    });
  };

  // handleChange supports nested names like "socialLinks.github"
  const handleChange = (e) => {
    const { name, value } = e.target;
    setHasChanges(true);

    const isUrlField =
      name === "avatarUrl" ||
      name === "website" ||
      name.startsWith("socialLinks.") ||
      name.startsWith("competitiveProfiles.");

    // FIX: Store the raw user input value. DO NOT prepend https:// here.
    const newValue = value;

    if (name.includes(".")) {
      const [section, key] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: newValue, // Store the raw value
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: newValue })); // Store the raw value
    }

    // run validation only if this is a URL field (Validation still works with raw value)
    if (isUrlField) {
      validateAndSetError(name, newValue);
    }
  };

  // final validation for all URL fields before submit
  const validateAllUrlsBeforeSubmit = (data) => {
    const errors = {};
    const check = (k, v) => {
      const trimmedValue = v ? v.trim() : "";
      if (!trimmedValue) return;

      // 1. General validation
      if (!isValidUrl(trimmedValue)) {
        errors[k] =
          "Please enter a valid URL structure (e.g., https://example.com).";
        return;
      }

      // 2. Platform-specific validation
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
            // Should not happen if isValidUrl passed, but good to be safe.
            errors[k] = "Invalid URL format.";
          }
        }
      }
    };

    // Use the raw data from formData for validation
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. Final validation - block submit if errors
    const validationErrors = validateAllUrlsBeforeSubmit(formData);
    if (Object.keys(validationErrors).length > 0) {
      setUrlErrors(validationErrors);
      // Optionally notify user
      return;
    }

    // 2. FIX: Create a protocol-fixed payload for the backend
    const dataToSubmit = { ...formData };

    // Apply protocol fix to top-level URL fields
    dataToSubmit.avatarUrl = ensureProtocol(dataToSubmit.avatarUrl);
    dataToSubmit.website = ensureProtocol(dataToSubmit.website);

    // Apply protocol fix to nested URL fields
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
    // End FIX

    // 3. Dispatch the action with the fully qualified URL data
    await dispatch(patchMyProfile(dataToSubmit));
    await dispatch(getMyProfile()); // Refresh profile to get updated data and timestamps

    // The form data state will be automatically reset from the useEffect on myProfile change,
    // which will pull the protocol-fixed URLs from the API.
    setIsEditing(false);
    setHasChanges(false);
    setUrlErrors({});
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
      // Re-fetch profile to get the latest stats and refresh timestamps
      await dispatch(getMyProfile());
    } finally {
      setRefreshing({ type: null });
    }
  };

  if (status === "loading" || !formData) {
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
        isEditing={isEditing}
        hasChanges={hasChanges}
        refreshing={refreshing}
        lastRefreshed={lastRefreshed}
        urlErrors={urlErrors} // pass url errors down for inline display
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onEditToggle={() => setIsEditing(!isEditing)}
        onRefresh={handleRefresh}
      />
    </div>
  );
}