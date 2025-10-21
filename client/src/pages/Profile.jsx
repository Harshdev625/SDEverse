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

  const handleSubmit = async (e) => {
    e.preventDefault();

 
    const validationErrors = validateAllUrlsBeforeSubmit(formData);
    if (Object.keys(validationErrors).length > 0) {
      setUrlErrors(validationErrors);
     
      return;
    }

    const dataToSubmit = { ...formData };


    dataToSubmit.avatarUrl = ensureProtocol(dataToSubmit.avatarUrl);
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
        urlErrors={urlErrors} 
        onChange={handleChange}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        onEditToggle={() => setIsEditing(!isEditing)}
        onRefresh={handleRefresh}
      />
    </div>
  );
}