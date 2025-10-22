import React, { useRef, useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "../utils/cropImage"; // Make sure this path is correct

export default function ProfileSection({
  isEditing,
  formData,
  handleChange,
  imageData,
  urlErrors = {},
}) {
  const {
    imagePreview,
    setImagePreview,
    uploadedImageBase64,
    setUploadedImageBase64,
    bannerPreview,
    setBannerPreview,
    uploadedBannerBase64,
    setUploadedBannerBase64,
  } = imageData;

  const fileInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  const [errorMsgImage, setErrorMsgImage] = useState("");
  const [errorMsgBanner, setErrorMsgBanner] = useState("");
  const [showAvatarHover, setShowAvatarHover] = useState(false);
  const [showBannerHover, setShowBannerHover] = useState(false);

  const MAX_SIZE_MB = 7;

  const [avatarEditorConfig, setAvatarEditorConfig] = useState({
    image: null,
    scale: 1,
    rotate: 0,
    width: 200,
    height: 200,
  });

  const [bannerEditorConfig, setBannerEditorConfig] = useState({
    image: null,
    scale: 1,
    rotate: 0,
    width: 600,
    height: 200,
  });

  const [avatarCrop, setAvatarCrop] = useState({ x: 0, y: 0 });
  const [bannerCrop, setBannerCrop] = useState({ x: 0, y: 0 });
  const [avatarCroppedAreaPixels, setAvatarCroppedAreaPixels] = useState(null);
  const [bannerCroppedAreaPixels, setBannerCroppedAreaPixels] = useState(null);

  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showBannerModal, setShowBannerModal] = useState(false);

  const onAvatarCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setAvatarCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const onBannerCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setBannerCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > MAX_SIZE_MB) {
      setErrorMsgImage(`File exceeds ${MAX_SIZE_MB}MB limit!`);
      e.target.value = "";
      return;
    } else {
      setErrorMsgImage("");
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarEditorConfig({
        ...avatarEditorConfig,
        image: reader.result,
        scale: 1,
        rotate: 0,
      });
      setShowAvatarModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024);

    if (fileSizeMB > MAX_SIZE_MB) {
      setErrorMsgBanner(`File exceeds ${MAX_SIZE_MB}MB limit!`);
      e.target.value = "";
      return;
    } else {
      setErrorMsgBanner("");
    }

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      if (bannerInputRef.current) {
        bannerInputRef.current.value = "";
      }
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerEditorConfig({
        ...bannerEditorConfig,
        image: reader.result,
        scale: 1,
        rotate: 0,
      });
      setShowBannerModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = async () => {
    if (avatarCroppedAreaPixels) {
      try {
        const editedImageBase64 = await getCroppedImg(
          avatarEditorConfig.image,
          avatarCroppedAreaPixels,
          avatarEditorConfig.rotate
        );

        setImagePreview(editedImageBase64);
        setUploadedImageBase64(editedImageBase64);
        handleChange({ target: { name: "avatarUrl", value: "" } });
        setShowAvatarModal(false);

        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      } catch (e) {
        console.error("Error cropping image:", e);
      }
    }
  };

  const handleSaveBanner = async () => {
    if (bannerCroppedAreaPixels) {
      try {
        const editedBannerBase64 = await getCroppedImg(
          bannerEditorConfig.image,
          bannerCroppedAreaPixels,
          bannerEditorConfig.rotate
        );

        setBannerPreview(editedBannerBase64);
        setUploadedBannerBase64(editedBannerBase64);
        handleChange({ target: { name: "bannerUrl", value: "" } });
        setShowBannerModal(false);

        if (bannerInputRef.current) {
          bannerInputRef.current.value = "";
        }
      } catch (e) {
        console.error("Error cropping banner:", e);
      }
    }
  };

  const handleCancelAvatar = () => {
    setShowAvatarModal(false);
  };

  const handleCancelBanner = () => {
    setShowBannerModal(false);
  };

  const handleReopenAvatarEditor = () => {
    if (imagePreview || uploadedImageBase64) {
      setAvatarEditorConfig({
        ...avatarEditorConfig,
        image: imagePreview || uploadedImageBase64,
        scale: 1,
        rotate: 0,
      });
      setShowAvatarModal(true);
    }
  };

  const handleReopenBannerEditor = () => {
    if (bannerPreview || uploadedBannerBase64) {
      setBannerEditorConfig({
        ...bannerEditorConfig,
        image: bannerPreview || uploadedBannerBase64,
        scale: 1,
        rotate: 0,
      });
      setShowBannerModal(true);
    }
  };

  const renderField = (
    label,
    name,
    value,
    isEditing,
    handleChange,
    isUrl = false
  ) => {
    const errorMsg = urlErrors[name];

    return (
      <div className="space-y-2">
        <label
          htmlFor={name}
          className="block font-medium text-gray-600 dark:text-gray-400 text-sm mb-1"
        >
          {label}
        </label>
        {isEditing ? (
          <>
            <input
              type={isUrl ? "url" : "text"}
              id={name}
              name={name}
              value={value}
              onChange={handleChange}
              className={`w-full px-4 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border ${
                errorMsg
                  ? "border-red-500 focus:ring-red-400"
                  : "border-gray-300 dark:border-gray-600 focus:ring-gray-300 dark:focus:ring-blue-500"
              } placeholder-gray-500 focus:ring-2 outline-none transition-all duration-200`}
              placeholder={`Enter your ${label.toLowerCase()}`}
            />
            {errorMsg && (
              <p className="text-red-500 text-sm mt-1">{errorMsg}</p>
            )}
          </>
        ) : isUrl && value ? (
          <>
            <a
              href={value.startsWith("http") ? value : `https://${value}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`break-all text-lg pt-1 pb-1 inline-block w-full ${
                errorMsg
                  ? "text-red-500"
                  : "text-emerald-400 hover:text-emerald-300 hover:underline"
              }`}
            >
              {value}
            </a>
            {errorMsg && (
              <p className="text-red-500 text-sm mt-1">{errorMsg}</p>
            )}
          </>
        ) : (
          <p className="text-gray-900 dark:text-white text-lg pt-1 pb-1 min-h-[44px] flex items-center">
            {value || (
              <span className="italic text-gray-500 dark:text-gray-400">
                Not set
              </span>
            )}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-2xl shadow-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="relative">
        <div
          className="relative h-48 group cursor-pointer"
          onMouseEnter={() => isEditing && setShowBannerHover(true)}
          onMouseLeave={() => setShowBannerHover(false)}
          onClick={() => isEditing && bannerInputRef.current?.click()}
        >
          <img
            src={
              bannerPreview ||
              formData.bannerUrl ||
              "https://png.pngtree.com/thumb_back/fh260/background/20210906/pngtree-promotional-float-triangle-purple-e-commerce-banner-image_805506.jpg"
            }
            alt="Banner"
            className="w-full h-full object-cover"
          />

          {isEditing && showBannerHover && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center transition-all">
              <svg
                className="w-12 h-12 text-white mb-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-white font-medium">
                Click to change banner
              </span>
              {bannerPreview && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReopenBannerEditor();
                  }}
                  className="mt-2 px-4 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600"
                >
                  Edit Current Banner
                </button>
              )}
            </div>
          )}
        </div>

        <div className="absolute -bottom-16 left-4 sm:left-8">
          <div
            className="relative group cursor-pointer"
            onMouseEnter={() => isEditing && setShowAvatarHover(true)}
            onMouseLeave={() => setShowAvatarHover(false)}
            onClick={() => isEditing && fileInputRef.current?.click()}
          >
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-gray-200 dark:bg-gray-600 shadow-xl">
              <img
                src={
                  imagePreview ||
                  formData.avatarUrl ||
                  "https://thvnext.bing.com/th/id/OIP.1waDZ8Q2eWBkenMscI08qAHaHa?w=181&h=181&c=7&r=0&o=7&cb=12&dpr=1.1&pid=1.7&rm=3"
                }
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/256x256/2d3748/cbd5e0?text=No+Image";
                }}
              />

              <div className="w-full h-full flex items-center justify-center text-gray-500 dark:text-gray-300">
                <span className="text-xs sm:text-sm">No Image</span>
              </div>
            </div>
            {isEditing && showAvatarHover && (
              <div className="absolute inset-0 rounded-full bg-black bg-opacity-50 flex flex-col items-center justify-center transition-all">
                <svg
                  className="w-8 h-8 text-white mb-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-white text-xs font-medium text-center px-2">
                  Change
                </span>
                {imagePreview && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReopenAvatarEditor();
                    }}
                    className="mt-1 px-2 py-0.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600"
                  >
                    Edit
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="pt-20 sm:pt-24 p-4 sm:p-6 lg:p-8">
        <div className="mt-6 space-y-6">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              {formData.fullName || "Your Name"}
            </h2>
            {formData.location && (
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {formData.location}
              </p>
            )}
          </div>

          {isEditing ? (
            <div className="space-y-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4 sm:p-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-600 pb-3">
                Edit Profile
              </h3>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                onChange={handleBannerChange}
                className="hidden"
              />
              {errorMsgImage && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  ⚠ {errorMsgImage}
                </p>
              )}
              {errorMsgBanner && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  ⚠ {errorMsgBanner}
                </p>
              )}

              <div className="border-t border-gray-200 dark:border-gray-600 pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {renderField(
                    "Full Name",
                    "fullName",
                    formData.fullName,
                    true,
                    handleChange
                  )}
                  {renderField(
                    "Location",
                    "location",
                    formData.location,
                    true,
                    handleChange
                  )}
                </div>

                <div className="mt-6">
                  <label
                    htmlFor="bio"
                    className="block font-medium text-gray-600 dark:text-gray-400 text-sm mb-1"
                  >
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    value={formData.bio}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-gray-300 dark:focus:ring-blue-500 outline-none transition-all duration-200 resize-y"
                    placeholder="Write something about yourself"
                  ></textarea>
                </div>

                <div className="mt-6">
                  {renderField(
                    "Website",
                    "website",
                    formData.website,
                    true,
                    handleChange,
                    true
                  )}
                </div>
              </div>
            </div>
          ) : (
            <>
              {formData.bio && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    About
                  </h3>
                  <p className="text-gray-900 dark:text-white whitespace-pre-wrap">
                    {formData.bio}
                  </p>
                </div>
              )}

              {formData.website && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">
                    Website
                  </h3>
                  <a
                    href={
                      formData.website.startsWith("http")
                        ? formData.website
                        : `https://${formData.website}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-emerald-400 hover:text-emerald-300 hover:underline"
                  >
                    {formData.website}
                  </a>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {showAvatarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Edit Profile Picture
              </h3>

              <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
                <div className="flex-1 flex justify-center items-center">
                  <div
                    className="relative bg-gray-100 dark:bg-gray-700 w-full"
                    style={{
                      height: "400px",
                    }}
                  >
                    <Cropper
                      image={avatarEditorConfig.image}
                      crop={avatarCrop}
                      zoom={avatarEditorConfig.scale}
                      rotation={avatarEditorConfig.rotate}
                      aspect={1}
                      cropShape="round"
                      onCropChange={setAvatarCrop}
                      onZoomChange={(zoom) =>
                        setAvatarEditorConfig((prev) => ({ ...prev, scale: zoom }))
                      }
                      onRotationChange={(rotate) =>
                        setAvatarEditorConfig((prev) => ({ ...prev, rotate }))
                      }
                      onCropComplete={onAvatarCropComplete}
                    />
                  </div>
                </div>

                <div className="flex-1 space-y-4 sm:space-y-6">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Adjust Image
                  </h4>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Zoom: {avatarEditorConfig.scale.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={avatarEditorConfig.scale}
                      onChange={(e) =>
                        setAvatarEditorConfig({
                          ...avatarEditorConfig,
                          scale: parseFloat(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Rotate: {avatarEditorConfig.rotate}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="1"
                      value={avatarEditorConfig.rotate}
                      onChange={(e) =>
                        setAvatarEditorConfig({
                          ...avatarEditorConfig,
                          rotate: parseInt(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>

                  <div className="pt-2 sm:pt-4">
                    {/* THIS IS THE FIXED LINE */}
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                      The circular area shows what will be visible in your
                      profile picture
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 sm:mt-8">
                <button
                  onClick={handleCancelAvatar}
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveAvatar}
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm sm:text-base"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showBannerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">
                Edit Banner
              </h3>

              <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
                <div className="flex-1 flex justify-center items-center overflow-x-auto">
                  <div
                    className="relative bg-gray-100 dark:bg-gray-700 w-full"
                    style={{
                      height: "400px",
                    }}
                  >
                    <Cropper
                      image={bannerEditorConfig.image}
                      crop={bannerCrop}
                      zoom={bannerEditorConfig.scale}
                      rotation={bannerEditorConfig.rotate}
                      aspect={bannerEditorConfig.width / bannerEditorConfig.height}
                      cropShape="rect"
                      onCropChange={setBannerCrop}
                      onZoomChange={(zoom) =>
                        setBannerEditorConfig((prev) => ({ ...prev, scale: zoom }))
                      }
                      onRotationChange={(rotate) =>
                        setBannerEditorConfig((prev) => ({ ...prev, rotate }))
                      }
                      onCropComplete={onBannerCropComplete}
                    />
                  </div>
                </div>

                <div className="flex-1 space-y-4 sm:space-y-6">
                  <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Adjust Banner
                  </h4>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Zoom: {bannerEditorConfig.scale.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="3"
                      step="0.1"
                      value={bannerEditorConfig.scale}
                      onChange={(e) =>
                        setBannerEditorConfig({
                          ...bannerEditorConfig,
                          scale: parseFloat(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                      Rotate: {bannerEditorConfig.rotate}°
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="1"
                      value={bannerEditorConfig.rotate}
                      onChange={(e) =>
                        setBannerEditorConfig({
                          ...bannerEditorConfig,
                          rotate: parseInt(e.target.value),
                        })
                      }
                      className="w-full"
                    />
                  </div>

                  <div className="pt-2 sm:pt-4">
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                      The rectangular area shows what will be visible as your
                      banner
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6 sm:mt-8">
                <button
                  onClick={handleCancelBanner}
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors font-medium text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveBanner}
                  className="flex-1 px-4 sm:px-6 py-2 sm:py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm sm:text-base"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}