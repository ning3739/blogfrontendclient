import { Metadata } from "next";
import sectionService from "@/app/lib/services/sectionService";
import blogService from "@/app/lib/services/blogService";
import projectService from "@/app/lib/services/projectService";
import ClientPage from "./clientpage";
import { formatTagTitle } from "@/app/lib/utils/formatTagTitle";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // 检查是否为认证相关路由，如果是则直接返回空metadata
  const authRoutes = ["login", "register", "reset-password"];
  const isAuthRoute = slug.some((segment) => authRoutes.includes(segment));

  if (isAuthRoute) {
    console.warn(
      `Auth route detected in generateMetadata: ${slug.join(
        "/"
      )}, skipping SEO generation`
    );
    return {};
  }

  if (slug.length === 1) {
    // 单级路由处理，如 /about, /journal, /musings, /dev-notes
    const pageSlug = slug[0];

    // 如果访问的是 blog 父 section，返回空 metadata（因为会 404）
    if (pageSlug === "blog") {
      return {};
    }

    if (pageSlug === "tag") {
      return {
        title: "标签详情 | Tag Details",
        description: "标签详情 | Tag Details",
        keywords: "标签详情 | Tag Details",
      };
    }

    if (pageSlug === "archive") {
      return {
        title: "归档详情 | Archive Details",
        description: "归档详情 | Archive Details",
        keywords: "归档详情 | Archive Details",
      };
    }

    if (pageSlug === "user") {
      return {
        title: "用户详情 | User Details",
        description: "用户详情 | User Details",
        keywords: "用户详情 | User Details",
      };
    }

    try {
      const response = await sectionService.getSectionSeoBySlug({
        slug: pageSlug,
      });

      if ("data" in response && response.data) {
        const section = response.data;
        return {
          title: `${section.title.zh} | ${section.title.en}`,
          description: `${section.description.zh} | ${section.description.en}`,
          keywords: `${section.keywords.zh} | ${section.keywords.en}`,
        };
      }
    } catch (error) {
      console.warn(`Failed to fetch SEO data for slug: ${pageSlug}`, error);
    }

    return {};
  } else if (slug.length === 2) {
    // 双级路由处理，如 /journal/123, /musings/456, /dev-notes/789
    const [sectionSlug, slugValue] = slug;

    try {
      if (sectionSlug === "tag") {
        return {
          title: `标签详情 |  ${formatTagTitle(slugValue)}`,
          description: `标签详情 |  ${formatTagTitle(slugValue)}`,
          keywords: `标签详情 |  ${formatTagTitle(slugValue)}`,
        };
      }

      if (
        sectionSlug === "journal" ||
        sectionSlug === "musings" ||
        sectionSlug === "dev-notes"
      ) {
        const blogResponse = await blogService.getBlogDetailsSeo({
          blog_slug: slugValue,
        });

        if ("data" in blogResponse && blogResponse.data) {
          const blog = blogResponse.data;
          return {
            title: `${blog.title.zh} | ${blog.title.en}`,
            description: `${blog.description.zh} | ${blog.description.en}`,
            keywords: `${blog.keywords.zh} | ${blog.keywords.en}`,
          };
        }
      }

      if (sectionSlug === "projects") {
        const projectResponse = await projectService.getProjectDetailsSeo({
          project_slug: slugValue,
        });

        if ("data" in projectResponse && projectResponse.data) {
          const project = projectResponse.data;
          return {
            title: `${project.title.zh} | ${project.title.en}`,
            description: `${project.description.zh} | ${project.description.en}`,
            keywords: `${project.keywords.zh} | ${project.keywords.en}`,
          };
        }
      }
    } catch (error) {
      console.warn(`Failed to fetch blog details for slug ${slugValue}`, error);
      console.warn(
        `Failed to fetch project details for slug ${slugValue}`,
        error
      );
    }

    return {};
  } else {
    // 超过两级的路由，返回空 metadata（因为会 404）
    return {};
  }
}

export default async function CatchAllSlugPage({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  return <ClientPage params={{ slug }} />;
}
