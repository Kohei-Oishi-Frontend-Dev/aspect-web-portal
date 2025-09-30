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
    const uploadedUrls: string[] = [];
    for (const file of files) {
      // 1) Request SAS + canonical fileUrl from backend
      const { sasUrl, fileUrl } = await StorageService.createUpload(file.name, file.type);

      // 2) Upload bytes directly to SAS URL
      await StorageService.uploadToSas(sasUrl, file);

      // 3) Optionally notify backend to link to record
      // await StorageService.linkFile(jobState.selectedProperty || null, fileUrl);

      uploadedUrls.push(fileUrl);
    }

    // 4) Save URLs to JobState.images
    updateJobState({ images: [...(jobState.images || []), ...uploadedUrls] });
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
