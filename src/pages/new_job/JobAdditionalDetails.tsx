import React, { useState } from "react";
import TextArea from "../../components/TextArea";
import ImageUploader from "../../components/ImageUploader";
import { useNewJob } from "./NewJobContext";
import { StorageService } from "../../api/services/storage";

const JobAdditionalDetails: React.FC = () => {
  const { jobState, updateJobState } = useNewJob();

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAdditionalDetailsChange = (value: string) => {
    updateJobState({ additionalDetails: value });
  };

  // receives File[] from ImageUploader and uploads to Azure using fetch + SAS URL
  const handleImagesSelected = async (files: File[]) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);

    const uploadedUrls: string[] = [];
    try {
      for (const file of files) {
        // 1) ask backend for SAS upload URL + final fileUrl
        const { sasUrl, fileUrl } = await StorageService.createUpload(
          file.name,
          file.type
        );

        // 2) upload to Azure using fetch (PUT). No XHR used.
        const res = await fetch(sasUrl, {
          method: "PUT",
          headers: {
            "x-ms-blob-type": "BlockBlob",
            "Content-Type": file.type || "application/octet-stream",
          },
          body: file,
        });

        if (!res.ok) {
          throw new Error(
            `Upload failed for ${file.name}: ${res.status} ${res.statusText}`
          );
        }

        // 3) collect final fileUrl (backend-provided canonical URL)
        uploadedUrls.push(fileUrl);
      }

      // 4) update JobState.images (append new URLs)
      updateJobState({ images: [...(jobState.images || []), ...uploadedUrls] });
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err?.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="w-full bg-white rounded-lg shadow-sm p-6 flex flex-col gap-2">
      {/* Additional details textarea */}
      <TextArea
        label="Additional details"
        value={jobState.additionalDetails}
        onChange={handleAdditionalDetailsChange}
        placeholder="Describe any access notes, hazards or other info..."
      />

      {/* Image uploader - emits File[] via onImagesSelected */}
      <div>
        <ImageUploader
          onImagesSelected={handleImagesSelected}
          maxFiles={10}
          maxFileSize={10 * 1024 * 1024}
          className="w-full"
          disabled={uploading}
        />
      </div>

      {uploading && <p className="text-sm text-gray-500">Uploading images…</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default JobAdditionalDetails;
