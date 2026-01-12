import {
  BarChart3,
  Bookmark,
  CreditCard,
  FileText,
  FolderDot,
  Home,
  type LucideIcon,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import React from "react";
import { useAuth } from "./useAuth";

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  path: string;
  active: boolean;
}

export const useSidebarRoutes = () => {
  const { user } = useAuth();
  const pathname = usePathname();
  const dashboardT = useTranslations("dashboard.menu");

  const routes: MenuItem[] = React.useMemo(() => {
    if (user && user.role === "admin") {
      return [
        {
          icon: Home,
          label: "快捷链接",
          path: "/dashboard",
          active: pathname === "/dashboard",
        },
        {
          icon: BarChart3,
          label: "数据分析",
          path: "/dashboard/analytics",
          active: pathname === "/dashboard/analytics",
        },
        {
          icon: FileText,
          label: "文章管理",
          path: "/dashboard/posts",
          active: pathname === "/dashboard/posts",
        },
        {
          icon: FolderDot,
          label: "项目管理",
          path: "/dashboard/projects",
          active: pathname === "/dashboard/projects",
        },
      ];
    }

    return [
      {
        icon: Home,
        label: dashboardT("quickLinks"),
        path: "/dashboard",
        active: pathname === "/dashboard",
      },
      {
        icon: Users,
        label: dashboardT("myProfile"),
        path: "/dashboard/profile",
        active: pathname === "/dashboard/profile",
      },
      {
        icon: Bookmark,
        label: dashboardT("mySaved"),
        path: "/dashboard/saved-blog",
        active: pathname === "/dashboard/saved-blog",
      },
      {
        icon: CreditCard,
        label: dashboardT("myPayments"),
        path: "/dashboard/payments",
        active: pathname === "/dashboard/payments",
      },
    ];
  }, [user, pathname, dashboardT]);

  return routes;
};
