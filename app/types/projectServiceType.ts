export interface ProjectIDSchema {
  project_id: number;
}

export interface GetProjectDetailsSeoRequest {
  project_slug: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DeleteProjectRequest extends ProjectIDSchema {}

export interface PublishOrUnpublishProjectRequest {
  project_id: number;
  is_publish: boolean;
}

export interface ProjectItemDashboardResponse {
  project_id: number;
  project_slug: string;
  project_type: string;
  cover_url: string;
  project_name: string;
  project_description: string;
  is_published: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ProjectItemResponse {
  project_id: number;
  project_slug: string;
  project_type: string;
  cover_url: string;
  project_name: string;
  project_description: string;
  created_at: string;
  updated_at?: string;
}

export interface ProjectRequestSchema {
  project_type: string;
  section_id?: number;
  seo_id: number;
  cover_id: number;
  chinese_title: string;
  chinese_description: string;
  chinese_content: string;
  attachment_id?: number;
  price: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CreateProjectRequest extends ProjectRequestSchema {}

export interface UpdateProjectRequest extends ProjectRequestSchema {
  project_slug: string;
}
