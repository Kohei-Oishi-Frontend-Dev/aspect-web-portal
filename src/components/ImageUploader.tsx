import React, { useEffect, useState } from "react";
import Uppy from "@uppy/core";
import { Dashboard } from "@uppy/react";
import "@uppy/core/dist/style.css";
import "@uppy/dashboard/dist/style.css";

interface ImageUploaderProps {
  onImagesSelected?: (files: File[]) => void;
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  allowedFileTypes?: string[];
  className?: string;
  disabled?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImagesSelected,
  maxFiles = 10,
  maxFileSize = 10 * 1024 * 1024,
  allowedFileTypes = ["image/*"],
  className = "",
  disabled = false,
}) => {
  const [uppy] = useState(
    () =>
      new Uppy({
        restrictions: {
          maxFileSize,
          maxNumberOfFiles: maxFiles,
          allowedFileTypes,
        },
        autoProceed: false,
      })
  );

  useEffect(() => {
    const handleFileAdded = (_file: any) => {
      // File added to Uppy
      console.log("File added:", _file);
    };

    const handleComplete = (result: any) => {
      const files = result.successful.map((file: any) => file.data);
      onImagesSelected?.(files);
      console.log("Upload complete! Files:", files);
    };

    uppy.on("file-added", handleFileAdded);
    uppy.on("complete", handleComplete);

    return () => {
      uppy.off("file-added", handleFileAdded);
      uppy.off("complete", handleComplete);
    };
  }, [uppy, onImagesSelected]);

  useEffect(() => {
    return () => {
      (uppy as any).close?.();
    };
  }, [uppy]);

  return (
    <div className={`w-full ${className}`}>
      <Dashboard
        uppy={uppy}
        plugins={[]}
        width="100%"
        height="400px"
        proudlyDisplayPoweredByUppy={false}
        showProgressDetails={true}
        note={`Images only, up to ${maxFiles} files, max ${Math.round(
          maxFileSize / (1024 * 1024)
        )}MB each`}
        locale={{
          strings: {
            // dropPaste: 'Drop images here, %{browse} or paste from clipboard',
            // browse: 'browse',
            uploadComplete: "Upload complete",
            uploadFailed: "Upload failed",
            uploadXFiles: {
              0: "Upload %{smart_count} file",
              1: "Upload %{smart_count} files",
            },
            uploadXNewFiles: {
              0: "Upload +%{smart_count} file",
              1: "Upload +%{smart_count} files",
            },
          },
        }}
        disabled={disabled}
      />
    </div>
  );
};

export default ImageUploader;
