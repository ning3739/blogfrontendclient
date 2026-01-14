import type {
  CreateSectionRequest,
  DeleteSectionRequest,
  GetSectionDetailsBySlugRequest,
  GetSectionDetailsResponse,
  GetSectionSeoBySlugRequest,
  GetSectionSeoResponse,
  UpdateSectionRequest,
} from "@/app/types/sectionServiceType";
import httpClient from "../http/client";

class SectionService {
  async getSectionSeoBySlug(payload: GetSectionSeoBySlugRequest) {
    return httpClient.get<GetSectionSeoResponse>(
      `/section/get-section-seo-by-slug/${payload.slug}`,
    );
  }

  async getSectionDetailsBySlug(payload: GetSectionDetailsBySlugRequest) {
    return httpClient.get<GetSectionDetailsResponse>(
      `/section/get-section-details-by-slug/${payload.slug}`,
    );
  }

  async updateSection(payload: UpdateSectionRequest) {
    return httpClient.patch<null>("/section/admin/update-section", payload);
  }

  async createSection(payload: CreateSectionRequest) {
    return httpClient.post<null>("/section/admin/create-section", payload);
  }

  async deleteSection(payload: DeleteSectionRequest) {
    return httpClient.delete<null>(`/section/admin/delete-section/${payload.section_id}`);
  }
}

export const sectionService = new SectionService();
export default sectionService;
