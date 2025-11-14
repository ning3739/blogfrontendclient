import httpClient from "../http/client";
import type {
  CreateSeoRequest,
  UpdateSeoRequest,
  DeleteSeoRequest,
} from "@/app/types/seoServiceType";
import { handleToastResponse } from "../utils/handleToastResponse";

class SeoService {
  async createSeo(payload: CreateSeoRequest) {
    const response = await httpClient.post("/seo/admin/create-seo", payload);
    handleToastResponse(response);
    return response;
  }

  async updateSeo(payload: UpdateSeoRequest) {
    const response = await httpClient.patch("/seo/admin/update-seo", payload);
    handleToastResponse(response);
    return response;
  }

  async deleteSeo(payload: DeleteSeoRequest) {
    const response = await httpClient.delete(
      `/seo/admin/delete-seo/${payload.seo_id}`
    );
    handleToastResponse(response);
    return response;
  }
}

export default new SeoService();
