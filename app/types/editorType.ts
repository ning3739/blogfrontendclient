import type { JSONContent } from "@tiptap/react";

// 博客编辑器相关类型
export interface BlogMetaData {
  selectedSeoId: number | null;
  selectedCoverImageId: number | null;
  selectedCoverImageUrl: string | null;
  selectedSectionId: number | null;
  selectedTags: number[];
  title: string;
  description: string;
}

export interface UsePostEditorProps {
  type: string | null;
  blogSlug: string | null;
  content: JSONContent | null;
  setContent: (content: JSONContent | null) => void;
}

export interface UsePostEditorReturn {
  blogMetaData: BlogMetaData;
  isBlogLoading: boolean;
  isSaving: boolean;
  handleBlogMetaDataSave: (data: BlogMetaData) => void;
  handleBlogSave: () => Promise<void>;
  validateBlogData: () => { isValid: boolean; missingFields: string[] };
}

// 项目编辑器相关类型
export interface ProjectMetaData {
  selectedSeoId: number | null;
  selectedCoverImageId: number | null;
  selectedCoverImageUrl: string | null;
  selectedDocumentId: number | null;
  selectedDocumentUrl: string | null;
  projectType: number;
  price: number | null;
  title: string;
  description: string;
}

export interface UseProjectEditorProps {
  type: string | null;
  projectSlug: string | null;
  sectionId: string | null;
  projectSectionId: number | undefined;
  content: JSONContent | null;
  setContent: (content: JSONContent | null) => void;
}

export interface UseProjectEditorReturn {
  projectMetaData: ProjectMetaData;
  isProjectLoading: boolean;
  isSaving: boolean;
  handleProjectMetaDataSave: (data: ProjectMetaData) => void;
  handleProjectSave: () => Promise<void>;
  validateProjectData: () => { isValid: boolean; missingFields: string[] };
}
