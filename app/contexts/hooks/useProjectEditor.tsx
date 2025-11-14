"use client";

import { useState, useEffect } from "react";
import { JSONContent } from "@tiptap/react";
import useSWR from "swr";
import toast from "react-hot-toast";
import projectService from "@/app/lib/services/projectService";

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
  handleProjectMetaDataSave: (data: ProjectMetaData) => void;
  handleProjectSave: () => Promise<void>;
  validateProjectData: () => { isValid: boolean; missingFields: string[] };
}

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

export const useProjectEditor = ({
  type,
  projectSlug,
  sectionId,
  projectSectionId,
  content,
  setContent,
}: UseProjectEditorProps): UseProjectEditorReturn => {
  const [projectMetaData, setProjectMetaData] = useState<ProjectMetaData>(
    initialProjectMetaData
  );

  // 在更新模式下获取项目详情
  const shouldFetchProject = type === "update" && !!projectSlug;

  const { data: projectDetails, isLoading: isProjectLoading } = useSWR(
    shouldFetchProject
      ? `/project/get-project-details/${projectSlug}?is_editor=true`
      : null
  );

  // 验证项目数据
  const validateProjectData = (): {
    isValid: boolean;
    missingFields: string[];
  } => {
    const missingFields: string[] = [];

    if (!projectMetaData.selectedSeoId) missingFields.push("SEO设置");
    if (!projectMetaData.selectedCoverImageId) missingFields.push("封面图片");
    if (!projectMetaData.title) missingFields.push("标题");
    if (!projectMetaData.description) missingFields.push("描述");
    if (
      projectMetaData.price !== null &&
      projectMetaData.price > 0 &&
      !projectMetaData.selectedDocumentId
    )
      missingFields.push("项目文件");

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  };

  // 当项目数据加载完成时，预填充表单
  useEffect(() => {
    if (projectDetails && type === "update") {
      const projectData = projectDetails;

      // 解析 JSON 内容
      let parsedContent: JSONContent | null;

      // 检查 chinese_content 是否存在且不为 undefined
      if (
        projectData.chinese_content &&
        projectData.chinese_content !== "undefined"
      ) {
        try {
          // 如果后端返回的是字符串，需要解析
          if (typeof projectData.chinese_content === "string") {
            parsedContent = JSON.parse(projectData.chinese_content);
          } else {
            // 如果已经是对象，直接使用
            parsedContent = projectData.chinese_content;
          }
        } catch (error) {
          console.error("Failed to parse chinese_content:", error);
          console.log("Raw chinese_content:", projectData.chinese_content);
          parsedContent = null;
        }
      } else {
        // 如果没有内容，设置为 null 以显示占位符
        parsedContent = null;
      }

      setContent(parsedContent);

      // 设置项目元数据
      setProjectMetaData({
        selectedSeoId: projectData.seo_id || null,
        selectedCoverImageId: projectData.cover_id || null,
        selectedCoverImageUrl: projectData.cover_url || null,
        selectedDocumentId: projectData.attachment_id || null,
        selectedDocumentUrl: projectData.attachment_url || null,
        projectType: parseInt(projectData.project_type) || 1,
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
    console.log("handleProjectSave called", {
      type,
      projectSlug,
      sectionId,
      projectSectionId,
    });
    try {
      // 创建新项目
      if (type === "project" && !projectSlug) {
        console.log("Creating new project...");
        const validation = validateProjectData();
        if (!validation.isValid) {
          toast.error(
            `请填写以下必填字段：${validation.missingFields.join("、")}`
          );
          return;
        }

        // 将JSONContent转换为字符串
        const contentString = JSON.stringify(content);

        // projectService.createProject 已经处理了 toast 显示
        await projectService.createProject({
          project_type: projectMetaData.projectType.toString(),
          section_id: projectSectionId,
          seo_id: projectMetaData.selectedSeoId!,
          cover_id: projectMetaData.selectedCoverImageId!,
          chinese_title: projectMetaData.title,
          chinese_description: projectMetaData.description,
          chinese_content: contentString,
          price: projectMetaData.price || 0,
          attachment_id: projectMetaData.selectedDocumentId || undefined,
        });
      }

      // 更新已有项目
      else if (type === "update" && projectSlug) {
        console.log("Updating existing project...");
        const validation = validateProjectData();
        if (!validation.isValid) {
          toast.error(
            `请填写以下必填字段：${validation.missingFields.join("、")}`
          );
          return;
        }

        // 将JSONContent转换为字符串
        const contentString = JSON.stringify(content);

        // projectService.updateProject 已经处理了 toast 显示
        await projectService.updateProject({
          project_slug: projectSlug,
          project_type: projectMetaData.projectType.toString(),
          section_id: projectSectionId,
          seo_id: projectMetaData.selectedSeoId!,
          cover_id: projectMetaData.selectedCoverImageId!,
          chinese_title: projectMetaData.title,
          chinese_description: projectMetaData.description,
          chinese_content: contentString,
          price: projectMetaData.price || 0,
          attachment_id: projectMetaData.selectedDocumentId || undefined,
        });
      } else {
        console.log("No matching condition for project save", {
          type,
          projectSlug,
          sectionId,
        });
      }
    } catch (error: any) {
      // projectService 中的 handleToastResponse 已经处理了 toast 显示
      // 这里只记录错误用于调试
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
