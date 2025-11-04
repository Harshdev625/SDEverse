import React, { useRef, useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropImage";
import {
  Plus,
  Trash2,
  MapPin,
  Calendar,
  ExternalLink,
  Pencil,
  Save,
  X,
  Link,
  Briefcase,
  Lightbulb,
} from "lucide-react";
import { 
  FaGithub, 
  FaLinkedin, 
  FaTwitter, 
  FaFacebook, 
  FaInstagram,
  FaCode
} from "react-icons/fa";
import { 
  SiLeetcode, 
  SiCodeforces, 
  SiCodechef
} from "react-icons/si";
import { format } from "date-fns";

const platformIcons = {
  github: <FaGithub size={20} className="text-gray-700 dark:text-gray-300" />,
  linkedin: <FaLinkedin size={20} className="text-blue-600" />,
  twitter: <FaTwitter size={20} className="text-sky-500" />,
  facebook: <FaFacebook size={20} className="text-blue-700" />,
  instagram: <FaInstagram size={20} className="text-pink-500" />,
  leetcode: <SiLeetcode size={20} className="text-orange-500" />,
  codeforces: <SiCodeforces size={20} className="text-blue-500" />,
  codechef: <SiCodechef size={20} className="text-amber-700" />,
  atcoder: <FaCode size={20} className="text-gray-600 dark:text-gray-400" />,
  spoj: <FaCode size={20} className="text-green-600" />,
  default: <Link size={20} className="text-gray-500" />,
};

const getPlatformIcon = (platform) => {
  return platformIcons[platform] || platformIcons.default;
};

const ProfileLinkField = ({ platform, link, name, isEditing, handleChange, error }) => {
  const icon = getPlatformIcon(platform);

  if (isEditing) {
    return (
      <div className="w-full">
        <label className="flex items-center gap-2 mb-1.5 text-xs font-medium text-gray-700 dark:text-gray-300">
          {icon}
          <span className="capitalize">{platform}</span>
        </label>
        <input
          type="url"
          name={name}
          value={link || ""}
          onChange={handleChange}
          placeholder={`https://${platform}.com/username`}
          className={`w-full px-3 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border text-sm ${
            error
              ? "border-red-500 focus:ring-red-400"
              : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400"
          } placeholder-gray-400 focus:ring-2 outline-none transition-all`}
        />
        {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
      </div>
    );
  }

  if (!link) return null;

  return (
    <a
      href={link.startsWith("http") ? link : `https://${link}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2.5 p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-all"
    >
      <div className="flex-shrink-0">{icon}</div>
      <div className="overflow-hidden flex-1 min-w-0">
        <span className="capitalize font-medium text-gray-900 dark:text-white block text-sm">
          {platform}
        </span>
        <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
          {link.replace(/^https?:\/\//, "")}
        </p>
      </div>
      <ExternalLink size={14} className="text-gray-400 flex-shrink-0" />
    </a>
  );
};

const formatDateForInput = (date) => {
  if (!date) return "";
  try {
    return new Date(date).toISOString().split("T")[0];
  } catch {
    return "";
  }
};

const formatDisplayDate = (date) => {
  if (!date) return "Present";
  try {
    return format(new Date(date), "MMM yyyy");
  } catch {
    return "Invalid Date";
  }
};

const EditField = ({ label, name, value, placeholder, isUrl = false, onChange, error }) => (
  <div className="space-y-1.5 w-full">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <input
      type={isUrl ? "url" : "text"}
      id={name}
      name={name}
      value={value || ""}
      onChange={onChange}
      className={`w-full px-3 py-2 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white border ${
        error
          ? "border-red-500 focus:border-red-500"
          : "border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-500"
      } placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none transition-colors text-sm`}
      placeholder={placeholder || `Enter ${label.toLowerCase()}`}
    />
    {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
  </div>
);

const EditTextarea = ({ label, name, value, placeholder, onChange }) => (
  <div className="space-y-1.5">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <textarea
      id={name}
      name={name}
      rows={4}
      value={value || ""}
      onChange={onChange}
      className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors resize-none placeholder-gray-400 dark:placeholder-gray-500 text-sm"
      placeholder={placeholder || `Write something about ${label.toLowerCase()}`}
    ></textarea>
  </div>
);

const EditDateInput = ({ label, name, value, onChange, disabled = false }) => (
  <div className="space-y-1.5">
    <label htmlFor={name} className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
    </label>
    <input
      type="date"
      id={name}
      name={name}
      value={formatDateForInput(value)}
      onChange={onChange}
      disabled={disabled}
      className={`w-full px-3 py-2 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white border border-gray-300 dark:border-gray-600 focus:border-blue-600 dark:focus:border-blue-500 focus:outline-none transition-colors text-sm ${
        disabled ? "bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60" : ""
      }`}
    />
  </div>
);

const EditCheckbox = ({ label, name, checked, onChange }) => (
  <div className="flex items-center gap-2">
    <input
      type="checkbox"
      id={name}
      name={name}
      checked={checked || false}
      onChange={onChange}
      className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 focus:ring-2 cursor-pointer"
    />
    <label htmlFor={name} className="text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none">
      {label}
    </label>
  </div>
);

const EmptyProfileSection = ({ title, message, icon }) => (
  <div className="text-center p-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
    <div className="flex justify-center mb-3">{icon}</div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
    <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">{message}</p>
  </div>
);

export default function ProfileSection({
  formData,
  isEditing,
  hasChanges,
  onChange: handleChange,
  onSubmit,
  onCancel,
  onEditToggle,
  urlErrors = {},
  imageData = {},
  readonly = false,
}) {
  const {
    setImagePreview,
    setUploadedImageBase64,
    setBannerPreview,
    setUploadedBannerBase64,
  } = imageData;

  const imagePreview = imageData.imagePreview || formData.avatarUrl || "https://thvnext.bing.com/th/id/OIP.1waDZ8Q2eWBkenMscI08qAHaHa?w=181&h=181&c=7&r=0&o=7&cb=12&dpr=1.1&pid=1.7&rm=3";
  const bannerPreview = imageData.bannerPreview || formData.bannerUrl || "https://png.pngtree.com/thumb_back/fh260/background/20210906/pngtree-promotional-float-triangle-purple-e-commerce-banner-image_805506.jpg";

  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [errorMsgImage, setErrorMsgImage] = useState("");
  const [errorMsgBanner, setErrorMsgBanner] = useState("");
  const [showBannerHover, setShowBannerHover] = useState(false);

  const MAX_SIZE_MB = 7;

  const [avatarEditorConfig, setAvatarEditorConfig] = useState({ image: null, scale: 1, rotate: 0 });
  const [bannerEditorConfig, setBannerEditorConfig] = useState({ image: null, scale: 1, rotate: 0, width: 600, height: 200 });
  const [avatarCrop, setAvatarCrop] = useState({ x: 0, y: 0 });
  const [bannerCrop, setBannerCrop] = useState({ x: 0, y: 0 });
  const [avatarCroppedAreaPixels, setAvatarCroppedAreaPixels] = useState(null);
  const [bannerCroppedAreaPixels, setBannerCroppedAreaPixels] = useState(null);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);

  const onAvatarCropComplete = useCallback((_, pixels) => setAvatarCroppedAreaPixels(pixels), []);
  const onBannerCropComplete = useCallback((_, pixels) => setBannerCroppedAreaPixels(pixels), []);

  const handleFileChange = (event, setConfig, setModal, setError) => {
    const file = event.target.files[0];
    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > MAX_SIZE_MB) {
      setError(`File exceeds ${MAX_SIZE_MB}MB limit!`);
      event.target.value = "";
      return;
    }
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      event.target.value = "";
      return;
    }
    
    setError("");
    const reader = new FileReader();
    reader.onloadend = () => {
      setConfig((prev) => ({ ...prev, image: reader.result, scale: 1, rotate: 0 }));
      setModal(true);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleSaveCrop = async (config, pixels, setPreview, setBase64, setModal, inputName) => {
    if (pixels) {
      try {
        const croppedImage = await getCroppedImg(config.image, pixels, config.rotate);
        setPreview(croppedImage);
        setBase64(croppedImage);
        setModal(false);
        handleChange({ target: { name: inputName, value: croppedImage } });
      } catch (error) {
        console.error("Error cropping image:", error);
      }
    }
  };

  const handleArrayChange = (arrayName, index, e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    const newArray = [...(formData[arrayName] || [])];
    const newItem = { ...newArray[index], [name]: newValue };

    if (name === "isCurrent" && checked) newItem.endDate = null;
    if (name === "isOngoing" && checked) newItem.endDate = null;
    
    if (name === "technologies") {
      newItem[name] = value.split(",").map((tech) => tech.trim()).filter(Boolean);
    }
    
    newArray[index] = newItem;
    handleChange({ target: { name: arrayName, value: newArray } });
  };

  const addArrayItem = (arrayName, template) => {
    const newArray = [...(formData[arrayName] || []), template];
    handleChange({ target: { name: arrayName, value: newArray } });
  };

  const removeArrayItem = (arrayName, index) => {
    const newArray = (formData[arrayName] || []).filter((_, i) => i !== index);
    handleChange({ target: { name: arrayName, value: newArray } });
  };

  const hasExperiences = formData.experiences && formData.experiences.length > 0;
  const hasProjects = formData.projects && formData.projects.length > 0;
  const hasLinks = Object.values(formData.competitiveProfiles || {}).some(Boolean) || 
                   Object.values(formData.socialLinks || {}).some(Boolean);

  return (
    <div className="space-y-4">
      <div className="rounded-lg shadow border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="relative">
          <div
            className="relative h-40 sm:h-48 lg:h-56 group"
            onMouseEnter={() => isEditing && setShowBannerHover(true)}
            onMouseLeave={() => isEditing && setShowBannerHover(false)}
          >
            <img
              src={bannerPreview}
              alt="Banner"
              className="w-full h-full object-cover"
            />
            {isEditing && (
              <div
                className={`absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center transition-opacity ${
                  showBannerHover ? "opacity-100" : "opacity-0"
                } group-hover:opacity-100 cursor-pointer`}
                onClick={() => bannerInputRef.current?.click()}
              >
                <Pencil size={20} className="text-white mb-1" />
                <span className="text-white text-sm font-medium">Change cover photo</span>
                <input ref={bannerInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, setBannerEditorConfig, setShowBannerModal, setErrorMsgBanner)} />
              </div>
            )}
          </div>

          {!readonly && (
            <div className="absolute top-4 right-4 z-10">
              {!isEditing ? (
                <button
                  onClick={onEditToggle}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-medium rounded-lg shadow hover:shadow-md transition-all border border-gray-300 dark:border-gray-600 text-sm"
                >
                  <Pencil size={16} />
                  <span>Edit</span>
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={onCancel}
                    className="flex items-center gap-1.5 px-4 py-2 font-medium rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all text-sm"
                  >
                    <X size={16} />
                    <span>Cancel</span>
                  </button>
                  <button
                    onClick={onSubmit}
                    disabled={!hasChanges || Object.keys(urlErrors).length > 0}
                    className={`flex items-center gap-1.5 px-4 py-2 font-medium rounded-lg transition-all text-sm ${
                      hasChanges && Object.keys(urlErrors).length === 0
                        ? "bg-blue-600 text-white hover:bg-blue-700 shadow"
                        : "bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    <Save size={16} />
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="absolute -bottom-12 sm:-bottom-14 left-6">
            <div className="relative group">
              <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full border-4 border-white dark:border-gray-900 overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-lg">
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              {isEditing && (
                <div
                  className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex flex-col items-center justify-center transition-opacity opacity-0 group-hover:opacity-100 cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Pencil size={18} className="text-white" />
                  <span className="text-white text-xs font-medium mt-0.5">Edit</span>
                  <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, setAvatarEditorConfig, setShowAvatarModal, setErrorMsgImage)} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-14 sm:pt-16 lg:pt-20 px-6 pb-5">
          {isEditing ? (
            <div className="space-y-4">
              <EditField label="Full Name" name="fullName" value={formData.fullName} placeholder="Your Full Name" onChange={handleChange} />
              <EditField label="Location" name="location" value={formData.location} placeholder="e.g., San Francisco, CA" onChange={handleChange} />
              {errorMsgImage && <p className="text-sm text-red-500 dark:text-red-400">⚠ {errorMsgImage}</p>}
              {errorMsgBanner && <p className="text-sm text-red-500 dark:text-red-400">⚠ {errorMsgBanner}</p>}
            </div>
          ) : (
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                {formData.fullName || "Your Name"}
              </h1>
              {formData.location && (
                <p className="text-gray-600 dark:text-gray-400 mt-1.5 flex items-center gap-1.5 text-sm">
                  <MapPin size={14} /> {formData.location}
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {(isEditing || formData.bio || formData.website) && (
        <div className="rounded-lg shadow border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">About</h2>
          {isEditing ? (
            <div className="space-y-4">
              <EditTextarea label="Bio" name="bio" value={formData.bio} placeholder="Write something about yourself..." onChange={handleChange} />
              <EditField label="Website" name="website" value={formData.website} placeholder="https://your-portfolio.com" isUrl={true} onChange={handleChange} error={urlErrors.website} />
            </div>
          ) : (
            <div className="space-y-3">
              {formData.bio && (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">{formData.bio}</p>
              )}
              {formData.website && (
                <div>
                  <a
                    href={formData.website.startsWith("http") ? formData.website : `https://${formData.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 text-sm font-medium"
                  >
                    <ExternalLink size={14} />
                    {formData.website.replace(/^https?:\/\//, "")}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      {(isEditing || hasExperiences) && (
        <div className="rounded-lg shadow border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Experience</h2>
          <div className="space-y-4">
            {isEditing && (formData.experiences || []).map((exp, index) => (
              <div key={index} className="p-5 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3 relative bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                <button type="button" onClick={() => removeArrayItem('experiences', index)} className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" aria-label="Remove experience">
                  <Trash2 size={16} />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <EditField label="Role / Title" name="role" value={exp.role} placeholder="e.g., Software Engineer" onChange={(e) => handleArrayChange('experiences', index, e)} />
                  <EditField label="Company" name="company" value={exp.company} placeholder="e.g., Google" onChange={(e) => handleArrayChange('experiences', index, e)} />
                </div>
                <EditField label="Location" name="location" value={exp.location} placeholder="e.g., San Francisco, CA" onChange={(e) => handleArrayChange('experiences', index, e)} />
                <EditTextarea label="Description" name="description" value={exp.description} placeholder="Describe your responsibilities..." onChange={(e) => handleArrayChange('experiences', index, e)} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <EditDateInput label="Start Date" name="startDate" value={exp.startDate} onChange={(e) => handleArrayChange('experiences', index, e)} />
                  <EditDateInput label="End Date" name="endDate" value={exp.endDate} onChange={(e) => handleArrayChange('experiences', index, e)} disabled={exp.isCurrent} />
                </div>
                <EditCheckbox label="I am currently working here" name="isCurrent" checked={exp.isCurrent} onChange={(e) => handleArrayChange('experiences', index, e)} />
              </div>
            ))}
            {isEditing && (
              <button type="button" onClick={() => addArrayItem('experiences', { company: "", role: "", description: "", location: "", startDate: "", endDate: null, isCurrent: false })} className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all font-medium">
                <Plus size={20} /> Add Experience
              </button>
            )}
            
            {!isEditing && hasExperiences ? (
              formData.experiences.map((exp, index) => (
                <div key={index} className="pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white">{exp.role}</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5">{exp.company}</p>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {formatDisplayDate(exp.startDate)} - {exp.isCurrent ? "Present" : formatDisplayDate(exp.endDate)}</span>
                    {exp.location && <span className="flex items-center gap-1"><MapPin size={12} /> {exp.location}</span>}
                  </div>
                  {exp.description && <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm whitespace-pre-wrap leading-relaxed">{exp.description}</p>}
                </div>
              ))
            ) : !isEditing && (
              <EmptyProfileSection 
                title="No experience to show"
                message="Add your past work experience to build your profile."
                icon={<Briefcase size={24} className="text-gray-400" />}
              />
            )}
          </div>
        </div>
      )}

      {(isEditing || hasProjects) && (
        <div className="rounded-lg shadow border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Projects</h2>
          <div className="space-y-4">
            {isEditing && (formData.projects || []).map((proj, index) => (
              <div key={index} className="p-5 rounded-lg border border-gray-200 dark:border-gray-700 space-y-3 relative bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                <button type="button" onClick={() => removeArrayItem('projects', index)} className="absolute top-3 right-3 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" aria-label="Remove project">
                  <Trash2 size={16} />
                </button>
                <EditField label="Project Title" name="title" value={proj.title} placeholder="e.g., My Awesome App" onChange={(e) => handleArrayChange('projects', index, e)} />
                <EditField label="Project URL" name="url" value={proj.url} placeholder="https://github.com/user/repo" isUrl={true} onChange={(e) => handleArrayChange('projects', index, e)} error={urlErrors[`projects[${index}].url`]} />
                <EditTextarea label="Description" name="description" value={proj.description} placeholder="Describe your project..." onChange={(e) => handleArrayChange('projects', index, e)} />
                <EditField label="Technologies" name="technologies" value={(proj.technologies || []).join(", ")} placeholder="e.g., React, Node.js" onChange={(e) => handleArrayChange('projects', index, e)} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <EditDateInput label="Start Date" name="startDate" value={proj.startDate} onChange={(e) => handleArrayChange('projects', index, e)} />
                  <EditDateInput label="End Date" name="endDate" value={proj.endDate} onChange={(e) => handleArrayChange('projects', index, e)} disabled={proj.isOngoing} />
                </div>
                <EditCheckbox label="This project is ongoing" name="isOngoing" checked={proj.isOngoing} onChange={(e) => handleArrayChange('projects', index, e)} />
              </div>
            ))}
            {isEditing && (
              <button type="button" onClick={() => addArrayItem('projects', { title: "", description: "", url: "", technologies: [], startDate: "", endDate: null, isOngoing: false })} className="w-full flex items-center justify-center gap-2 px-6 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 rounded-lg hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all font-medium">
                <Plus size={20} /> Add Project
              </button>
            )}

            {!isEditing && hasProjects ? (
              formData.projects.map((proj, index) => (
                <div key={index} className="pb-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-1.5">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white">{proj.title}</h3>
                    {proj.url && (
                      <a href={proj.url.startsWith("http") ? proj.url : `https://${proj.url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 text-xs font-medium whitespace-nowrap">
                        View Project <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <span className="flex items-center gap-1"><Calendar size={12} /> {formatDisplayDate(proj.startDate)} - {proj.isOngoing ? "Present" : formatDisplayDate(proj.endDate)}</span>
                  </div>
                  {proj.description && <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm whitespace-pre-wrap leading-relaxed">{proj.description}</p>}
                  {(proj.technologies || []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2.5">
                      {proj.technologies.map((tech, i) => (
                        <span key={i} className="px-2.5 py-1 bg-blue-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md text-xs font-medium border border-gray-200 dark:border-gray-600">{tech}</span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            ) : !isEditing && (
              <EmptyProfileSection 
                title="No projects to show"
                message="Add your personal projects to showcase your skills."
                icon={<Lightbulb size={24} className="text-gray-400" />}
              />
            )}
          </div>
        </div>
      )}

      {(isEditing || hasLinks) && (
        <div className="rounded-lg shadow border bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Object.keys(formData.competitiveProfiles || {}).map((platform) => (
              <ProfileLinkField
                key={platform}
                platform={platform}
                link={formData.competitiveProfiles[platform]}
                name={`competitiveProfiles.${platform}`}
                isEditing={isEditing}
                handleChange={handleChange}
                error={urlErrors[`competitiveProfiles.${platform}`]}
              />
            ))}
            {Object.keys(formData.socialLinks || {}).map((platform) => (
              <ProfileLinkField
                key={platform}
                platform={platform}
                link={formData.socialLinks[platform]}
                name={`socialLinks.${platform}`}
                isEditing={isEditing}
                handleChange={handleChange}
                error={urlErrors[`socialLinks.${platform}`]}
              />
            ))}
          </div>
          {!isEditing && !hasLinks && (
            <EmptyProfileSection 
              title="No links to show"
              message="Add links to your social and competitive profiles."
              icon={<Link size={24} className="text-gray-400" />}
            />
          )}
        </div>
      )}

      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit Profile Picture</h3>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative bg-gray-100 dark:bg-gray-700 w-full h-[300px] rounded-lg overflow-hidden">
                    <Cropper
                      image={avatarEditorConfig.image}
                      crop={avatarCrop}
                      zoom={avatarEditorConfig.scale}
                      rotation={avatarEditorConfig.rotate}
                      aspect={1}
                      cropShape="round"
                      onCropChange={setAvatarCrop}
                      onZoomChange={(zoom) => setAvatarEditorConfig((prev) => ({ ...prev, scale: zoom }))}
                      onRotationChange={(rotate) => setAvatarEditorConfig((prev) => ({ ...prev, rotate }))}
                      onCropComplete={onAvatarCropComplete}
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">Adjust Image</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zoom: {avatarEditorConfig.scale.toFixed(1)}x</label>
                    <input type="range" min="1" max="3" step="0.1" value={avatarEditorConfig.scale} onChange={(e) => setAvatarEditorConfig((prev) => ({ ...prev, scale: parseFloat(e.target.value) }))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rotate: {avatarEditorConfig.rotate}°</label>
                    <input type="range" min="0" max="360" step="1" value={avatarEditorConfig.rotate} onChange={(e) => setAvatarEditorConfig((prev) => ({ ...prev, rotate: parseInt(e.target.value) }))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAvatarModal(false)} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium">Cancel</button>
                <button onClick={() => handleSaveCrop(avatarEditorConfig, avatarCroppedAreaPixels, setImagePreview, setUploadedImageBase64, setShowAvatarModal, 'avatarUrl')} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBannerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Edit Banner</h3>
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative bg-gray-100 dark:bg-gray-700 w-full h-[300px] rounded-lg overflow-hidden">
                    <Cropper
                      image={bannerEditorConfig.image}
                      crop={bannerCrop}
                      zoom={bannerEditorConfig.scale}
                      rotation={bannerEditorConfig.rotate}
                      aspect={bannerEditorConfig.width / bannerEditorConfig.height}
                      cropShape="rect"
                      onCropChange={setBannerCrop}
                      onZoomChange={(zoom) => setBannerEditorConfig((prev) => ({ ...prev, scale: zoom }))}
                      onRotationChange={(rotate) => setBannerEditorConfig((prev) => ({ ...prev, rotate }))}
                      onCropComplete={onBannerCropComplete}
                    />
                  </div>
                </div>
                <div className="flex-1 space-y-4">
                  <h4 className="text-base font-semibold text-gray-900 dark:text-white">Adjust Banner</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Zoom: {bannerEditorConfig.scale.toFixed(1)}x</label>
                    <input type="range" min="1" max="3" step="0.1" value={bannerEditorConfig.scale} onChange={(e) => setBannerEditorConfig((prev) => ({ ...prev, scale: parseFloat(e.target.value) }))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rotate: {bannerEditorConfig.rotate}°</label>
                    <input type="range" min="0" max="360" step="1" value={bannerEditorConfig.rotate} onChange={(e) => setBannerEditorConfig((prev) => ({ ...prev, rotate: parseInt(e.target.value) }))} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowBannerModal(false)} className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors font-medium">Cancel</button>
                <button onClick={() => handleSaveCrop(bannerEditorConfig, bannerCroppedAreaPixels, setBannerPreview, setUploadedBannerBase64, setShowBannerModal, 'bannerUrl')} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">Save Changes</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}