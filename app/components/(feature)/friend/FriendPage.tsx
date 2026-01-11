"use client";

import { Link2 } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import type React from "react";
import useSWR from "swr";
import EmptyState from "@/app/components/ui/error/EmptyState";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import { useAuth } from "@/app/contexts/hooks/useAuth";
import type { SectionListItem } from "@/app/types/sectionServiceType";
import FriendLinkList from "./FriendLinkList";
import FriendTextInput from "./FriendTextInput";

interface FriendPageProps {
  sectionData: SectionListItem;
}

const FriendPage: React.FC<FriendPageProps> = ({ sectionData }) => {
  const commonT = useTranslations("common");
  const { data: friendDetails, isLoading, error } = useSWR("/friend/get-friend-details");
  const { isAuthenticated } = useAuth();

  // 如果 sectionData 不存在，显示加载状态
  if (!sectionData) {
    return (
      <LoadingSpinner message={commonT("loading")} size="md" variant="wave" fullScreen={true} />
    );
  }

  // 简洁的加载状态
  if (isLoading) {
    return (
      <LoadingSpinner message={commonT("loading")} size="md" variant="wave" fullScreen={true} />
    );
  }

  // 简洁的错误状态
  if (error) {
    return (
      <ErrorDisplay
        title={commonT("loadFailed")}
        message={commonT("loadFailedMessage")}
        type="error"
        showReload={true}
      />
    );
  }

  return (
    <motion.div
      className="min-h-screen mt-16"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto px-3 py-12">
        {/* 页面标题区域 */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.h1
            className="text-4xl mb-4 text-foreground-50 font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {sectionData.title}
          </motion.h1>
          <motion.p
            className="text-lg max-w-2xl mx-auto leading-relaxed text-foreground-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {sectionData.description}
          </motion.p>

          {/* 分隔线 */}
          <motion.div
            className="max-w-2xl h-px bg-border-100 mx-auto mt-8"
            initial={{ opacity: 0, scaleX: 0 }}
            animate={{ opacity: 1, scaleX: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          />
        </motion.div>

        {/* 输入区域 */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <motion.div
            className="rounded-sm p-8 border bg-card-100 border-border-100"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            whileHover={{ scale: 1.02 }}
          >
            <FriendTextInput
              isAuthenticated={isAuthenticated}
              friend_id={friendDetails.friend_id}
            />
          </motion.div>
        </motion.div>

        {/* 链接列表区域 */}
        {friendDetails?.friend_id ? (
          <motion.div
            className="mb-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.4 }}
          >
            <motion.div
              className="w-full h-px mb-16 bg-border-100"
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.8, delay: 1.6 }}
            ></motion.div>
            <FriendLinkList friend_id={friendDetails.friend_id} />
          </motion.div>
        ) : (
          <EmptyState
            icon={Link2}
            title={commonT("notFound")}
            description={commonT("notFoundMessage")}
          />
        )}
      </div>
    </motion.div>
  );
};

export default FriendPage;
