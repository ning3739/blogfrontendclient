"use client";

import { notFound } from "next/navigation";
import ArchivePage from "@/app/components/(feature)/archive/ArchivePage";
import BlogDetails from "@/app/components/(feature)/blog/BlogDetails";
import BlogPage from "@/app/components/(feature)/blog/BlogPage";
import ForumPage from "@/app/components/(feature)/forum/ForumPage";
import FriendPage from "@/app/components/(feature)/friend/FriendPage";
import ProjectDetails from "@/app/components/(feature)/project/ProjectDetails";
import ProjectPage from "@/app/components/(feature)/project/ProjectPage";
import TagDetails from "@/app/components/(feature)/tag/TagDetails";
import TagPage from "@/app/components/(feature)/tag/TagPage";
import UserPage from "@/app/components/(feature)/user/UserPage";
import { useSectionDetailsBySlug } from "@/app/contexts/hooks/useSection";

export default function ClientPage({ params }: { params: { slug: string[] } }) {
  const { slug } = params;
  const pageSlug = slug[0];

  // 始终调用 hook，但只在需要时传递有效的 slug
  const needsSectionData =
    slug.length === 1 &&
    ["journal", "musings", "dev-notes", "projects", "forum", "blogroll"].includes(pageSlug);
  const { section: sectionData } = useSectionDetailsBySlug(needsSectionData ? pageSlug : null);

  if (slug.length === 1) {
    // 第一级路由处理，使用 slug，如 /about, /journal, /musings, /dev-notes
    const levelOneRoutes = [
      "tag",
      "archive",
      "journal",
      "musings",
      "dev-notes",
      "projects",
      "forum",
      "blogroll",
      "about",
      "user",
    ];

    if (!levelOneRoutes.includes(pageSlug)) {
      notFound();
    }

    // 对于不需要 section 数据的路由，提前返回
    if (pageSlug === "tag") {
      return <TagPage />;
    }

    if (pageSlug === "archive") {
      return <ArchivePage />;
    }

    if (pageSlug === "user") {
      return <UserPage />;
    }

    return (
      <>
        {/* 博客相关的子 section - blog 父 section 不提供直接访问 */}
        {(pageSlug === "journal" || pageSlug === "musings" || pageSlug === "dev-notes") &&
          sectionData && <BlogPage sectionData={sectionData} />}
        {pageSlug === "projects" && <ProjectPage sectionData={sectionData} />}
        {pageSlug === "forum" && <ForumPage sectionData={sectionData} />}
        {pageSlug === "blogroll" && <FriendPage sectionData={sectionData} />}
      </>
    );
  } else if (slug.length === 2) {
    const [sectionSlug, slugValue] = slug;

    const leveltwoRoutes = ["journal", "musings", "dev-notes", "projects", "tag"];

    if (!leveltwoRoutes.includes(sectionSlug)) {
      notFound();
    }

    return (
      <>
        {/* 博客相关的子 section 详情 */}
        {(sectionSlug === "journal" ||
          sectionSlug === "musings" ||
          sectionSlug === "dev-notes") && <BlogDetails blogSlug={slugValue} />}
        {/* 项目相关的子 section 详情 */}
        {sectionSlug === "projects" && <ProjectDetails projectSlug={slugValue} />}
        {sectionSlug === "tag" && <TagDetails tagSlug={slugValue} />}
      </>
    );
  } else {
    // 超过两级的路由，返回 404
    notFound();
  }
}
