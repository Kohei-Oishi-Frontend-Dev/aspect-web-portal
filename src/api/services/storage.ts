import { ApiClient } from "../client";

export interface CreateUploadResponse {
  sasUrl: string;   // PUT endpoint for Azure (SAS)
  fileUrl: string;  // canonical URL to reference later (may include no SAS token)
}

export class StorageService {
  private static api = new ApiClient(import.meta.env.VITE_AZURE_FILE_UPLOAD_BASE_URL || "");

  // Ask backend to create an upload target (file location + SAS URL).
  // Backend should return { sasUrl, fileUrl }.
  static async createUpload(fileName: string, contentType?: string): Promise<CreateUploadResponse> {
    const res = await this.api.post<CreateUploadResponse>("/api/getUploadUrl", {
      fileName,
      contentType,
    });
    return res.data;
  }
}