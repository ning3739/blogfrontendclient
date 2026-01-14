import type { MetadataRoute } from "next";
import httpClient from "@/app/lib/http/client";
import type { BlogSitemapItem } from "@/app/types/blogServiceType";
import type { ProjectSitemapItem } from "@/app/types/projectServiceType";
import type { SectionChild, SectionListResponse } from "@/app/types/sectionServiceType";
import type { TagSitemapItem } from "@/app/types/tagServiceType";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://heyxiaoli.com";

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/tag`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/archive`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/copyright`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    // 设置语言为英文
    httpClient.setLocale("en");

    // 获取所有 sections
    const sectionsResponse = await httpClient.get("/section/get-section-lists");

    if (!("data" in sectionsResponse)) {
      console.error("Failed to fetch sections for sitemap");
      return staticRoutes;
    }

    const sections = (sectionsResponse.data as SectionListResponse[]) || [];

    // 扁平化 sections - 将所有 children 提取出来
    const allSections: Array<SectionListResponse | (SectionChild & { id: number })> = [];
    sections.forEach((section) => {
      // 添加父 section（如果不是 blog 且 is_active）
      if (section.is_active && section.slug !== "blog") {
        allSections.push(section);
      }
      // 添加所有子 sections（如果有 children）
      if (section.children && Array.isArray(section.children)) {
        section.children.forEach((child) => {
          if (child.is_active !== false) {
            // 添加 section_id 用于博客查询
            allSections.push({ ...child, id: child.section_id });
          }
        });
      }
    });

    // 为每个 section 创建路由
    const sectionRoutes: MetadataRoute.Sitemap = allSections
      .filter((section) => section.slug !== "blog")
      .map((section) => ({
        url: `${baseUrl}/${section.slug}`,
        lastModified: new Date(section.updated_at || new Date()),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

    // 获取所有博客文章
    const blogRoutes: MetadataRoute.Sitemap = [];
    const blogSections = allSections.filter((section) =>
      ["journal", "musings", "dev-notes"].includes(section.slug),
    );

    for (const section of blogSections) {
      try {
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const blogsResponse = await httpClient.get("/blog/get-blog-lists", {
            params: {
              section_id: "id" in section ? section.id : section.section_id,
              page,
              size: 100,
              published_only: true,
            },
          });

          if (!("data" in blogsResponse) || !blogsResponse.data) {
            console.error(`Failed to fetch blogs for section ${section.slug} page ${page}`);
            break;
          }

          const responseData = blogsResponse.data as {
            items?: BlogSitemapItem[];
            pagination?: { total_pages?: number };
          };
          const blogs = responseData.items || [];

          if (blogs.length === 0) {
            hasMore = false;
            break;
          }

          const sectionBlogRoutes = blogs.map((blog) => ({
            url: `${baseUrl}/${section.slug}/${blog.blog_slug}`,
            lastModified: new Date(blog.updated_at || new Date()),
            changeFrequency: "monthly" as const,
            priority: 0.6,
          }));

          blogRoutes.push(...sectionBlogRoutes);

          // 检查是否还有更多页
          const totalPages = responseData.pagination?.total_pages || 1;
          hasMore = page < totalPages;
          page++;
        }
      } catch (error) {
        console.error(`Error fetching blogs for section ${section.slug}:`, error);
      }
    }

    // 获取所有项目
    const projectRoutes: MetadataRoute.Sitemap = [];
    try {
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const projectsResponse = await httpClient.get("/project/get-project-lists", {
          params: {
            page,
            size: 100,
            published_only: true,
          },
        });

        if (!("data" in projectsResponse) || !projectsResponse.data) {
          console.error(`Failed to fetch projects page ${page}`);
          break;
        }

        const projectData = projectsResponse.data as {
          items?: ProjectSitemapItem[];
          pagination?: { total_pages?: number };
        };
        const projects = projectData.items || [];

        if (projects.length === 0) {
          hasMore = false;
          break;
        }

        const pageProjectRoutes = projects.map((project) => ({
          url: `${baseUrl}/projects/${project.project_slug}`,
          lastModified: new Date(project.updated_at || new Date()),
          changeFrequency: "monthly" as const,
          priority: 0.7,
        }));

        projectRoutes.push(...pageProjectRoutes);

        // 检查是否还有更多页
        const totalPages = projectData.pagination?.total_pages || 1;
        hasMore = page < totalPages;
        page++;
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    }

    // 获取所有标签
    const tagRoutes: MetadataRoute.Sitemap = [];
    try {
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const tagsResponse = await httpClient.get("/tag/get-tag-lists", {
          params: {
            page,
            size: 100,
            published_only: true,
          },
        });

        if (!("data" in tagsResponse) || !tagsResponse.data) {
          console.error(`Failed to fetch tags page ${page}`);
          break;
        }

        const tagData = tagsResponse.data as {
          items?: TagSitemapItem[];
          pagination?: { total_pages?: number };
        };
        const tags = tagData.items || [];

        if (tags.length === 0) {
          hasMore = false;
          break;
        }

        const pageTagRoutes = tags.map((tag: TagSitemapItem) => ({
          url: `${baseUrl}/tag/${tag.slug}`,
          lastModified: new Date(tag.updated_at || tag.created_at || new Date()),
          changeFrequency: "weekly" as const,
          priority: 0.6,
        }));

        tagRoutes.push(...pageTagRoutes);

        // 检查是否还有更多页
        const totalPages = tagData.pagination?.total_pages || 1;
        hasMore = page < totalPages;
        page++;
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }

    // 合并所有路由
    return [...staticRoutes, ...sectionRoutes, ...blogRoutes, ...projectRoutes, ...tagRoutes];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    return staticRoutes;
  }
}
