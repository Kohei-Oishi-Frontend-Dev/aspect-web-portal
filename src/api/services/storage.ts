import { ApiClient } from "../client";

export interface CreateUploadResponse {
  sasUrl: string;
  fileUrl: string;
}

export class StorageService {
  private static api = new ApiClient(import.meta.env.VITE_AZURE_FILE_UPLOAD_BASE_URL || "");

  static async createUpload(fileName: string, contentType?: string): Promise<CreateUploadResponse> {
    const res = await this.api.post<CreateUploadResponse>("/api/getUploadUrl", {
      fileName,
      contentType,
    });
    return res.data;
  }

  // new: upload file bytes to SAS URL using fetch
  static async uploadToSas(sasUrl: string, file: File): Promise<void> {
    const res = await fetch(sasUrl, {
      method: "PUT",
      headers: {
        "x-ms-blob-type": "BlockBlob",
        "Content-Type": file.type || "application/octet-stream",
      },
      body: file,
    });
    if (!res.ok) {
      throw new Error(`Azure upload failed: ${res.status} ${res.statusText}`);
    }
  }

  // optional: tell backend to link uploaded file to a Job/WorkOrder
  static async linkFile(objectId: string | null, fileUrl: string) {
    await this.api.post("/api/linkAzureFile", { objectId, fileUrl });
  }
}