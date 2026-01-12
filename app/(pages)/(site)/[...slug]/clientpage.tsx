"use client";

import dynamic from "next/dynamic";
import { notFound } from "next/navigation";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import { useSectionDetailsBySlug } from "@/app/contexts/hooks/useSection";

const Loading = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <LoadingSpinner variant="wave" message="" />
  </div>
);

// 使用 dynamic 懒加载页面组件，减少初始 bundle 大小
const ArchivePage = dynamic(() => import("@/app/components/(feature)/archive/ArchivePage"), {
  loading: Loading,
});
const BlogDetails = dynamic(() => import("@/app/components/(feature)/blog/BlogDetails"), {
  loading: Loading,
});
const BlogPage = dynamic(() => import("@/app/components/(feature)/blog/BlogPage"), {
  loading: Loading,
});
const ForumPage = dynamic(() => import("@/app/components/(feature)/forum/ForumPage"), {
  loading: Loading,
});
const FriendPage = dynamic(() => import("@/app/components/(feature)/friend/FriendPage"), {
  loading: Loading,
});
const ProjectDetails = dynamic(() => import("@/app/components/(feature)/project/ProjectDetails"), {
  loading: Loading,
});
const ProjectPage = dynamic(() => import("@/app/components/(feature)/project/ProjectPage"), {
  loading: Loading,
});
const TagDetails = dynamic(() => import("@/app/components/(feature)/tag/TagDetails"), {
  loading: Loading,
});
const TagPage = dynamic(() => import("@/app/components/(feature)/tag/TagPage"), {
  loading: Loading,
});
const UserPage = dynamic(() => import("@/app/components/(feature)/user/UserPage"), {
  loading: Loading,
});
const CopyrightPage = dynamic(() => import("@/app/components/(feature)/content/CopyrightPage"), {
  loading: Loading,
});
const PrivacyPolicyPage = dynamic(
  () => import("@/app/components/(feature)/content/PrivacyPolicyPage"),
  {
    loading: Loading,
  },
);

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
      "copyright",
      "privacy-policy",
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

    if (pageSlug === "copyright") {
      return <CopyrightPage />;
    }

    if (pageSlug === "privacy-policy") {
      return <PrivacyPolicyPage />;
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
