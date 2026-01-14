import type {
  CreateProjectRequest,
  DeleteProjectRequest,
  GetProjectDetailsSeoRequest,
  PublishOrUnpublishProjectRequest,
  UpdateProjectRequest,
} from "@/app/types/projectServiceType";
import httpClient from "../http/client";

class ProjectService {
  private redirectToPreview(projectSlug: string) {
    window.location.replace(`/dashboard/preview/?projectSlug=${projectSlug}&type=project`);
  }

  async getProjectDetailsSeo(payload: GetProjectDetailsSeoRequest) {
    return httpClient.get(`/project/get-project-details-seo/${payload.project_slug}`);
  }

  async updateProject(payload: UpdateProjectRequest) {
    const response = await httpClient.patch("/project/admin/update-project", payload);
    if (response.status === 200 && "data" in response && response.data) {
      this.redirectToPreview(response.data as string);
    }
    return response;
  }

  async createProject(payload: CreateProjectRequest) {
    const response = await httpClient.post("/project/admin/create-project", payload);
    if (response.status === 200 && "data" in response && response.data) {
      this.redirectToPreview(response.data as string);
    }
    return response;
  }

  async togglePublishStatus(payload: PublishOrUnpublishProjectRequest) {
    return httpClient.patch("/project/admin/publish-or-unpublish-project", payload);
  }

  async deleteProject(payload: DeleteProjectRequest) {
    return httpClient.delete(`/project/admin/delete-project/${payload.project_id}`);
  }
}

export const projectService = new ProjectService();
export default projectService;
