import httpClient from "../http/client";
import type {
  GetProjectDetailsSeoRequest,
  DeleteProjectRequest,
  CreateProjectRequest,
  UpdateProjectRequest,
  PublishOrUnpublishProjectRequest,
} from "@/app/types/projectServiceType";
import { handleToastResponse } from "../utils/handleToastResponse";

class ProjectService {
  async getProjectDetailsSeo(payload: GetProjectDetailsSeoRequest) {
    return httpClient.get(
      `/project/get-project-details-seo/${payload.project_slug}`
    );
  }

  async updateProject(payload: UpdateProjectRequest) {
    const response = await httpClient.patch(
      `/project/admin/update-project`,
      payload
    );
    if (response.status === 200 && "data" in response) {
      window.location.replace(
        `/dashboard/preview/?projectSlug=${response.data}&type=project`
      );
    }
    handleToastResponse(response);
    return response;
  }

  async createProject(payload: CreateProjectRequest) {
    const response = await httpClient.post(
      `/project/admin/create-project`,
      payload
    );
    if (response.status === 200 && "data" in response) {
      window.location.replace(
        `/dashboard/preview?projectSlug=${response.data}&type=project`
      );
    }
    handleToastResponse(response);
    return response;
  }

  async togglePublishStatus(payload: PublishOrUnpublishProjectRequest) {
    const response = await httpClient.patch(
      `/project/admin/publish-or-unpublish-project`,
      payload
    );
    handleToastResponse(response);
    return response;
  }

  async deleteProject(payload: DeleteProjectRequest) {
    const response = await httpClient.delete(
      `/project/admin/delete-project/${payload.project_id}`
    );
    handleToastResponse(response);
    return response;
  }
}

export default new ProjectService();
