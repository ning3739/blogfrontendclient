import type { AxiosProgressEvent } from "axios";
import type {
  DeleteMediaRequest,
  DownloadMediaRequest,
  UploadMediaRequest,
} from "@/app/types/mediaServiceType";
import httpClient from "../http/client";

class MediaService {
  async uploadMedia(
    payload: UploadMediaRequest,
    onProgress?: (progressEvent: AxiosProgressEvent) => void,
  ) {
    const formData = new FormData();
    payload.files.forEach((file) => formData.append("files", file));

    return httpClient.upload("/media/admin/upload-media", formData, {
      uploadProgress: onProgress,
    });
  }

  async downloadMedia(payload: DownloadMediaRequest) {
    return httpClient.download("/media/admin/download-media", {
      media_id: payload.media_id,
    });
  }

  async deleteMedia(payload: DeleteMediaRequest) {
    return httpClient.delete("/media/admin/delete-media", { data: payload });
  }
}

export const mediaService = new MediaService();
export default mediaService;
