import React, { useState } from "react";
import { Camera, Loader, Save, X } from "lucide-react";
import api from "../lib/axios";

interface AvatarUploadProps {
  employeeId: string;
  currentAvatarUrl?: string | null;
  onUploadSuccess?: (newAvatarUrl: string) => void;
  size?: "sm" | "md" | "lg";
  autoUpload?: boolean; // If true, uploads immediately. If false, shows save button
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({
  employeeId,
  currentAvatarUrl,
  onUploadSuccess,
  size = "md",
  autoUpload = false,
}) => {
  const [uploading, setUploading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const sizeClasses = {
    sm: "w-16 h-16",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("File size must be less than 5MB");
      return;
    }

    // Create preview URL
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);
    setPreviewFile(file);

    // If autoUpload is true, upload immediately
    if (autoUpload) {
      await uploadFile(file);
    }
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const response = await api.post(
        `/employees/${employeeId}/avatar`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      const newAvatarUrl = response.data.avatarUrl;
      setAvatarUrl(newAvatarUrl);
      setPreviewFile(null);
      setPreviewUrl(null);

      if (onUploadSuccess) {
        onUploadSuccess(newAvatarUrl);
      }
    } catch (error) {
      console.error("Avatar upload failed:", error);
      alert("Failed to upload avatar. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (previewFile) {
      await uploadFile(previewFile);
    }
  };

  const handleCancel = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewFile(null);
    setPreviewUrl(null);
  };

  const displayUrl = previewUrl || avatarUrl;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={`${sizeClasses[size]} relative group`}>
        {/* Avatar Display */}
        <div className="w-full h-full rounded-full overflow-hidden bg-gray-200 border-2 border-gray-300">
          {displayUrl ? (
            <img
              src={displayUrl}
              alt="Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary-100 text-primary-600 text-2xl font-bold">
              {employeeId.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Upload Overlay */}
        {!previewFile && (
          <label
            htmlFor={`avatar-upload-${employeeId}`}
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          >
            {uploading ? (
              <Loader className="text-white animate-spin" size={24} />
            ) : (
              <Camera className="text-white" size={24} />
            )}
          </label>
        )}

        <input
          id={`avatar-upload-${employeeId}`}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </div>

      {/* Action Buttons */}
      {!autoUpload && previewFile && (
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={uploading}
            className="px-3 py-1.5 text-white rounded-md text-xs font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1"
            style={{ backgroundColor: '#076653' }}
          >
            {uploading ? (
              <>
                <Loader size={14} className="animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save size={14} />
                Save Photo
              </>
            )}
          </button>
          <button
            onClick={handleCancel}
            disabled={uploading}
            className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-xs font-medium hover:bg-gray-300 disabled:opacity-50 flex items-center gap-1"
          >
            <X size={14} />
            Cancel
          </button>
        </div>
      )}

      <p className="text-xs text-gray-500 text-center">
        {uploading
          ? "Uploading..."
          : previewFile
          ? "Click Save to upload"
          : "Hover to change photo"}
      </p>
    </div>
  );
};

export default AvatarUpload;
