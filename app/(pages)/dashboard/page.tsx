"use client";

import {
  Bookmark,
  BookOpen,
  CreditCard,
  FolderOpen,
  Handshake,
  Image,
  Plus,
  Search,
  Tag,
  User,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import React from "react";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import { useAuth } from "@/app/hooks/useAuth";

interface QuickActionButtonProps {
  icon: React.ReactNode;
  title: string;
  borderColorClass: string;
  bgColorClass: string;
  textColorClass: string;
  onClick?: () => void;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = React.memo(
  ({ icon, title, borderColorClass, bgColorClass, textColorClass, onClick }) => {
    return (
      <motion.div
        className="group cursor-pointer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
      >
        <div
          className={`h-full transition-[box-shadow,transform] duration-300 border-l-4 bg-card-100 rounded-sm border border-border-100 shadow-sm hover:shadow-xl hover:scale-[1.01] hover:-translate-y-1 p-7 ${borderColorClass}`}
        >
          <div className="flex flex-col items-center text-center gap-4">
            <div className={`p-3 rounded-lg ${bgColorClass}`}>
              <div className={textColorClass}>{icon}</div>
            </div>
            <h3 className="text-lg font-semibold text-foreground-50 group-hover:text-primary-600 transition-colors">
              {title}
            </h3>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <Plus className="w-5 h-5 text-primary-500" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  },
);

QuickActionButton.displayName = "QuickActionButton";

export default function DashboardPage() {
  const { user, isAuthenticated, userLoading } = useAuth();
  const router = useRouter();
  const dashboardT = useTranslations("dashboard");

  // 如果已认证但用户数据还未加载，提前返回加载状态
  // 这样可以避免在 user 未加载时渲染错误的 dashboard
  if (isAuthenticated && (userLoading || !user)) {
    return (
      <LoadingSpinner
        message="加载中..."
        size="lg"
        variant="wave"
        fullScreen
        className="bg-background-100"
      />
    );
  }

  const quickActions =
    user && user.role === "admin"
      ? [
          {
            icon: <BookOpen className="w-6 h-6" />,
            title: "创建博客",
            borderColorClass: "border-l-primary-500",
            bgColorClass: "bg-primary-100",
            textColorClass: "text-primary-500",
            onClick: () => {
              router.push("/dashboard/editor?type=blog");
            },
          },
          {
            icon: <FolderOpen className="w-6 h-6" />,
            title: "创建项目",
            borderColorClass: "border-l-success-500",
            bgColorClass: "bg-success-100",
            textColorClass: "text-success-500",
            onClick: () => {
              router.push("/dashboard/editor?type=project");
            },
          },
          {
            icon: <Search className="w-6 h-6" />,
            title: "SEO优化",
            borderColorClass: "border-l-warning-500",
            bgColorClass: "bg-warning-100",
            textColorClass: "text-warning-500",
            onClick: () => {
              router.push("/dashboard/seo");
            },
          },
          {
            icon: <Tag className="w-6 h-6" />,
            title: "管理标签",
            borderColorClass: "border-l-info-500",
            bgColorClass: "bg-info-100",
            textColorClass: "text-info-500",
            onClick: () => {
              router.push("/dashboard/tags");
            },
          },
          {
            icon: <Image className="w-6 h-6" />,
            title: "管理媒体",
            borderColorClass: "border-l-error-500",
            bgColorClass: "bg-error-100",
            textColorClass: "text-error-500",
            onClick: () => {
              router.push("/dashboard/media");
            },
          },
          {
            icon: <Users className="w-6 h-6" />,
            title: "管理用户",
            borderColorClass: "border-l-primary-400",
            bgColorClass: "bg-primary-100",
            textColorClass: "text-primary-400",
            onClick: () => {
              router.push("/dashboard/users");
            },
          },
          {
            icon: <CreditCard className="w-6 h-6" />,
            title: "管理支付",
            borderColorClass: "border-l-success-400",
            bgColorClass: "bg-success-100",
            textColorClass: "text-success-400",
            onClick: () => {
              router.push("/dashboard/payments?type=admin");
            },
          },
          {
            icon: <Handshake className="w-6 h-6" />,
            title: "友链管理",
            borderColorClass: "border-l-primary-400",
            bgColorClass: "bg-primary-100",
            textColorClass: "text-primary-400",
            onClick: () => {
              router.push("/dashboard/friends");
            },
          },
        ]
      : [
          {
            icon: <User className="w-6 h-6" />,
            title: dashboardT("menu.myProfile"),
            borderColorClass: "border-l-primary-400",
            bgColorClass: "bg-primary-100",
            textColorClass: "text-primary-400",
            onClick: () => {
              router.push("/dashboard/profile");
            },
          },
          {
            icon: <Bookmark className="w-6 h-6" />,
            title: dashboardT("menu.mySaved"),
            borderColorClass: "border-l-primary-400",
            bgColorClass: "bg-primary-100",
            textColorClass: "text-primary-400",
            onClick: () => {
              router.push("/dashboard/saved-blog");
            },
          },
          {
            icon: <CreditCard className="w-6 h-6" />,
            title: dashboardT("menu.myPayments"),
            borderColorClass: "border-l-primary-400",
            bgColorClass: "bg-primary-100",
            textColorClass: "text-primary-400",
            onClick: () => {
              router.push("/dashboard/payments?type=user");
            },
          },
        ];

  return (
    <div className="min-h-screen bg-background-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* 页面标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          {user && user.role === "admin" ? (
            <>
              <h1 className="text-3xl font-bold text-foreground-50 mb-2">仪表板</h1>
              <p className="text-foreground-300">选择下面的快捷操作来快速开始</p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-foreground-50 mb-2">
                {dashboardT("quickLinks.title")}
              </h1>
              <p className="text-foreground-300">{dashboardT("quickLinks.description")}</p>
            </>
          )}
        </motion.div>

        {/* 快捷操作网格 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8"
        >
          {quickActions.map((action, index) => (
            <motion.div
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <QuickActionButton {...action} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
