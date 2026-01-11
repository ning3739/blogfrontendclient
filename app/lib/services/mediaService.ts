import type {
  DeleteMediaRequest,
  DownloadMediaRequest,
  UploadMediaRequest,
} from "@/app/types/mediaServiceType";
import httpClient from "../http/client";

class MediaService {
  async uploadMedia(payload: UploadMediaRequest, onProgress?: (progressEvent: any) => void) {
    const formData = new FormData();
    payload.files.forEach((file) => formData.append("files", file));

    return httpClient.upload("/media/admin/upload-media", formData, {
      uploadProgress: onProgress,
    });
  }

  async downloadMedia(payload: DownloadMediaRequest) {
    return httpClient.download("/media/admin/download-media", payload);
  }

  async deleteMedia(payload: DeleteMediaRequest) {
    return httpClient.delete("/media/admin/delete-media", { data: payload });
  }
}

export const mediaService = new MediaService();
export default mediaService;
