import React, { useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";

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
  } = imageData;
  const fileInputRef = useRef(null);
  const editorRef = useRef(null);
  const [errorMsgImage, setErrorMsgImage] = useState("");
  const MAX_SIZE_MB = 7;

  const [avatarEditorConfig, setAvatarEditorConfig] = useState({
    image: null,
    scale: 1,
    rotate: 0,
    borderRadius: 100,
  });
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);

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
        image: reader.result,
        scale: 1,
        rotate: 0,
        borderRadius: 100,
      });
      setShowAvatarEditor(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAvatar = () => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      const editedImageBase64 = canvas.toDataURL();
      
      setImagePreview(editedImageBase64);
      setUploadedImageBase64(editedImageBase64);
      handleChange({ target: { name: "avatarUrl", value: "" } });
      setShowAvatarEditor(false);
    }
  };

  const handleCancelAvatar = () => {
    setShowAvatarEditor(false);
    setAvatarEditorConfig({
      image: null,
      scale: 1,
      rotate: 0,
      borderRadius: 100,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUrlChange = (e) => {
    handleChange(e);
    if (e.target.value) {
      setImagePreview(null);
      setUploadedImageBase64(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
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
    <div className="p-6 sm:p-8 rounded-2xl shadow-lg border bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
      <h3 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500 mb-6 border-b border-gray-200 dark:border-gray-700 pb-3">
        Profile Details
      </h3>

      <div className="space-y-8">
        {/* MODIFIED: Avatar section with inline editor when editing */}
        <div className="flex flex-col lg:flex-row items-start gap-6">
          {/* Left Side: Profile Preview - How others see your profile */}
          <div className="flex flex-col items-center gap-4 lg:w-1/2">
            <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Profile Preview
            </h4>
            {imagePreview || formData.avatarUrl ? (
              <img
                src={imagePreview || formData.avatarUrl}
                alt="Profile"
                className="w-40 h-40 object-cover rounded-full shadow-xl border-4 border-blue-500 transform hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/160x160/2d3748/cbd5e0?text=No+Image";
                }}
              />
            ) : (
              <div className="w-40 h-40 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-gray-500 dark:text-gray-300 shadow-xl border-4 border-gray-300 dark:border-gray-600">
                <span className="text-sm">No Image</span>
              </div>
            )}
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              This is how others see your profile avatar
            </p>
          </div>

          {isEditing && (
            <div className="w-full lg:w-1/2 space-y-4">
              <h4 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Edit Avatar
              </h4>
              
              {/* Image upload input */}
              <div className="space-y-2">
                <label className="block font-medium text-gray-600 dark:text-gray-400 text-sm mb-1">
                  Upload Image
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full px-4 py-2 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-gray-300 dark:focus:ring-blue-500 outline-none transition-all duration-200"
                />

                {uploadedImageBase64 && !errorMsgImage && (
                  <p className="text-sm text-green-600 dark:text-green-400">
                    ✓ Image uploaded
                  </p>
                )}
                {errorMsgImage && (
                  <p className="text-sm text-red-500 dark:text-red-400">
                    ⚠ {errorMsgImage}
                  </p>
                )}
              </div>

              {showAvatarEditor && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-4">
                  <div className="flex flex-col items-center gap-4">
                    <AvatarEditor
                      ref={editorRef}
                      image={avatarEditorConfig.image}
                      width={200}
                      height={200}
                      border={20}
                      borderRadius={avatarEditorConfig.borderRadius}
                      color={[0, 0, 0, 0.6]}
                      scale={avatarEditorConfig.scale}
                      rotate={avatarEditorConfig.rotate}
                      className="border-2 border-gray-300 dark:border-gray-600"
                    />

                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
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

                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
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

                    {/* Border Radius Control */}
                    <div className="w-full">
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                        Shape: {avatarEditorConfig.borderRadius === 100 ? "Circle" : "Square"}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        step="50"
                        value={avatarEditorConfig.borderRadius}
                        onChange={(e) =>
                          setAvatarEditorConfig({
                            ...avatarEditorConfig,
                            borderRadius: parseInt(e.target.value),
                          })
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 w-full">
                      <button
                        onClick={handleCancelAvatar}
                        className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSaveAvatar}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                      >
                        Apply Changes
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  OR
                </span>
                <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600"></div>
              </div>

              {renderField(
                "Avatar URL",
                "avatarUrl",
                formData.avatarUrl,
                true,
                handleUrlChange,
                true
              )}
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

        <div>
          <label
            htmlFor="bio"
            className="block font-medium text-gray-600 dark:text-gray-400 text-sm mb-1"
          >
            Bio
          </label>
          {isEditing ? (
            <textarea
              id="bio"
              name="bio"
              rows={4}
              value={formData.bio}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-gray-300 dark:focus:ring-blue-500 outline-none transition-all duration-200 resize-y"
              placeholder="Write something about yourself"
            ></textarea>
          ) : (
            <p className="text-gray-900 dark:text-white text-lg pt-1 pb-1 min-h-[100px] whitespace-pre-wrap">
              {formData.bio || (
                <span className="italic text-gray-500 dark:text-gray-400">
                  No bio provided
                </span>
              )}
            </p>
          )}
        </div>

        <div>
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