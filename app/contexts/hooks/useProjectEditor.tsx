"use client";

import type { JSONContent } from "@tiptap/react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import useSWR from "swr";
import projectService from "@/app/lib/services/projectService";
import type {
  ProjectMetaData,
  UseProjectEditorProps,
  UseProjectEditorReturn,
} from "@/app/types/editorType";
import type { GetProjectEditorDetailsResponse } from "@/app/types/projectServiceType";
import type { TiptapContent } from "@/app/types/tiptapType";

// 重新导出类型供其他组件使用
export type { ProjectMetaData, UseProjectEditorProps, UseProjectEditorReturn };

const initialProjectMetaData: ProjectMetaData = {
  selectedSeoId: null,
  selectedCoverImageId: null,
  selectedCoverImageUrl: null,
  selectedDocumentId: null,
  selectedDocumentUrl: null,
  projectType: 1, // 默认为Web应用
  price: null,
  title: "",
  description: "",
};

// 解析 JSON 内容的通用函数（移到组件外部避免重复创建）
const parseContent = (content: TiptapContent): JSONContent | null => {
  if (!content) return null;

  try {
    return content as JSONContent;
  } catch (error) {
    console.error("Failed to parse content:", error);
    return null;
  }
};

export const useProjectEditor = ({
  type,
  projectSlug,
  sectionId,
  projectSectionId,
  content,
  setContent,
}: UseProjectEditorProps): UseProjectEditorReturn => {
  const [projectMetaData, setProjectMetaData] = useState<ProjectMetaData>(initialProjectMetaData);

  // 在更新模式下获取项目详情
  const shouldFetchProject = type === "update" && !!projectSlug;

  const { data: projectDetails, isLoading: isProjectLoading } =
    useSWR<GetProjectEditorDetailsResponse>(
      shouldFetchProject ? `/project/get-project-details/${projectSlug}?is_editor=true` : null,
    );

  // 验证项目数据
  const validateProjectData = useCallback((): {
    isValid: boolean;
    missingFields: string[];
  } => {
    const fields = [
      { value: projectMetaData.selectedSeoId, name: "SEO设置" },
      { value: projectMetaData.selectedCoverImageId, name: "封面图片" },
      { value: projectMetaData.title, name: "标题" },
      { value: projectMetaData.description, name: "描述" },
    ];

    const missingFields = fields.filter((f) => !f.value).map((f) => f.name);

    if (
      projectMetaData.price !== null &&
      projectMetaData.price > 0 &&
      !projectMetaData.selectedDocumentId
    ) {
      missingFields.push("项目文件");
    }

    return { isValid: missingFields.length === 0, missingFields };
  }, [projectMetaData]);

  // 当项目数据加载完成时，预填充表单
  useEffect(() => {
    if (projectDetails && type === "update") {
      const projectData = projectDetails;
      setContent(parseContent(projectData.chinese_content));

      // 设置项目元数据
      setProjectMetaData({
        selectedSeoId: projectData.seo_id || null,
        selectedCoverImageId: projectData.cover_id || null,
        selectedCoverImageUrl: projectData.cover_url || null,
        selectedDocumentId: projectData.attachment_id || null,
        selectedDocumentUrl: projectData.attachment_url || null,
        projectType: parseInt(projectData.project_type, 10) || 1,
        price: projectData.project_price || null,
        title: projectData.chinese_title || "",
        description: projectData.chinese_description || "",
      });
    }
  }, [projectDetails, type, setContent]);

  const handleProjectMetaDataSave = (data: ProjectMetaData) => {
    setProjectMetaData(data);
  };

  const handleProjectSave = async (): Promise<void> => {
    try {
      // 创建新项目
      if (type === "project" && !projectSlug) {
        const validation = validateProjectData();
        if (!validation.isValid) {
          toast.error(`请填写以下必填字段：${validation.missingFields.join("、")}`);
          return;
        }

        const response = await projectService.createProject({
          project_type: projectMetaData.projectType.toString(),
          section_id: projectSectionId || null,
          seo_id: projectMetaData.selectedSeoId || null,
          cover_id: projectMetaData.selectedCoverImageId!,
          chinese_title: projectMetaData.title,
          chinese_description: projectMetaData.description,
          chinese_content: content || { type: "doc", content: [] },
          price: projectMetaData.price || 0,
          attachment_id: projectMetaData.selectedDocumentId || null,
        });

        if (response.status === 200) {
          toast.success("message" in response ? response.message : "Project created successfully");
        } else {
          toast.error("error" in response ? response.error : "Failed to create project");
        }
      }

      // 更新已有项目
      else if (type === "update" && projectSlug) {
        const validation = validateProjectData();
        if (!validation.isValid) {
          toast.error(`请填写以下必填字段：${validation.missingFields.join("、")}`);
          return;
        }

        const response = await projectService.updateProject({
          project_slug: projectSlug,
          project_type: projectMetaData.projectType.toString(),
          section_id: projectSectionId || null,
          seo_id: projectMetaData.selectedSeoId || null,
          cover_id: projectMetaData.selectedCoverImageId!,
          chinese_title: projectMetaData.title,
          chinese_description: projectMetaData.description,
          chinese_content: content || { type: "doc", content: [] },
          price: projectMetaData.price || 0,
          attachment_id: projectMetaData.selectedDocumentId || null,
        });

        if (response.status === 200) {
          toast.success("message" in response ? response.message : "Project updated successfully");
        } else {
          toast.error("error" in response ? response.error : "Failed to update project");
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save project";
      toast.error(errorMessage);
      console.error("Project save failed:", error);
    }
  };

  return {
    projectMetaData,
    isProjectLoading,
    handleProjectMetaDataSave,
    handleProjectSave,
    validateProjectData,
  };
};
