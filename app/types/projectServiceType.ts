import type { TiptapContent } from "./tiptapType";

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
  section_id: number | null;
  seo_id: number | null;
  cover_id: number;
  chinese_title: string;
  chinese_description: string;
  chinese_content: TiptapContent;
  attachment_id: number | null;
  price: number;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface CreateProjectRequest extends ProjectRequestSchema {}

export interface UpdateProjectRequest extends ProjectRequestSchema {
  project_slug: string;
}

// Sitemap 专用类型
export interface ProjectSitemapItem {
  project_id: number;
  project_slug: string;
  updated_at?: string;
  created_at: string;
}

// 项目编辑器专用类型
export interface GetProjectEditorDetailsResponse {
  project_id: number;
  section_id: number | null;
  seo_id: number | null;
  cover_id: number;
  cover_url: string;
  attachment_id: number | null;
  attachment_url: string | null;
  project_type: string;
  project_price: number;
  chinese_title: string;
  chinese_description: string;
  chinese_content: TiptapContent;
}

// Project SEO 响应类型
export interface GetProjectDetailsSeoResponse {
  title: {
    zh: string;
    en: string;
  };
  description: {
    zh: string;
    en: string;
  };
  keywords: {
    zh: string;
    en: string;
  };
}
