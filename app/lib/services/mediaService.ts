import httpClient from "../http/client";
import type {
  UploadMediaRequest,
  DownloadMediaRequest,
  DeleteMediaRequest,
} from "@/app/types/mediaServiceType";
import { handleToastResponse } from "../utils/handleToastResponse";

class MediaService {
  async uploadMedia(
    payload: UploadMediaRequest,
    onProgress?: (progressEvent: any) => void
  ) {
    // 将文件数组转换为 FormData
    const formData = new FormData();
    payload.files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    const response = await httpClient.upload(
      "/media/admin/upload-media",
      formData,
      {
        uploadProgress: onProgress,
      }
    );
    handleToastResponse(response);
    return response;
  }

  async downloadMedia(payload: DownloadMediaRequest) {
    return httpClient.download("/media/admin/download-media", payload);
  }

  async deleteMedia(payload: DeleteMediaRequest) {
    const response = await httpClient.delete("/media/admin/delete-media", {
      data: payload,
    });
    handleToastResponse(response);
    return response;
  }
}

export default new MediaService();
