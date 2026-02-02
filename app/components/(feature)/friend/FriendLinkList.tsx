"use client";

import { ExternalLink, Globe, Star } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import React, { useEffect, useState } from "react";
import useSWR from "swr";
import { Button } from "@/app/components/ui/button/Button";
import EmptyState from "@/app/components/ui/error/EmptyState";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import httpClient from "@/app/lib/http/client";
import type {
  GetFriendListItemsResponse,
  GetFriendListResponse,
} from "@/app/types/friendServiceType";
import { FriendType } from "@/app/types/friendServiceType";

// 辅助函数：获取枚举的 name 字符串
const getFriendTypeName = (type: FriendType): string => {
  return FriendType[type];
};

const FriendLinkList = ({ friend_id }: { friend_id: number }) => {
  const friendT = useTranslations("friend");
  const commonT = useTranslations("common");
  const [limit] = useState(20);
  const [cursor, setCursor] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allFriends, setAllFriends] = useState<GetFriendListItemsResponse[]>([]);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  // 使用SWR获取初始数据
  const {
    data: friendLists,
    isLoading,
    error,
  } = useSWR(friend_id ? `/friend/get-friend-list/${friend_id}?limit=${limit}&cursor=null` : null);

  // 处理SWR数据，设置初始状态
  // 注意：全局 fetcher 已经提取了 response.data，所以 friendLists 就是数据本身
  useEffect(() => {
    if (friendLists && "pagination" in friendLists) {
      // 设置友链列表（可能为空数组）
      setAllFriends(friendLists.friend_lists || []);
      setCursor(friendLists.pagination.next_cursor);
      setHasNext(friendLists.pagination.has_next);
    } else {
      // 当没有数据时，确保 allFriends 为空数组
      setAllFriends([]);
    }
  }, [friendLists]);

  // 按类型分类友链
  const { featuredFriends, normalFriends } = React.useMemo(() => {
    // 按类型分类所有累积的友链
    // 后端返回 type_name 是枚举的 name 属性（字符串），与 FriendType 枚举的 name 对应
    const featuredFriends = allFriends.filter(
      (friend) => friend.type_name === getFriendTypeName(FriendType.featured),
    );
    const normalFriends = allFriends.filter(
      (friend) => friend.type_name === getFriendTypeName(FriendType.normal),
    );

    return {
      featuredFriends,
      normalFriends,
    };
  }, [allFriends]);

  // 处理加载更多
  const handleLoadMore = async () => {
    if (!hasNext || isLoadingMore || !cursor) return;

    setIsLoadingMore(true);
    try {
      const url = `/friend/get-friend-list/${friend_id}?limit=${limit}&cursor=${cursor}`;
      const response = await httpClient.get<GetFriendListResponse>(url);

      if (response && "data" in response && response.data) {
        const responseData = response.data;

        if (responseData.friend_lists && responseData.pagination) {
          // 合并新友链到现有列表
          setAllFriends((prev) => [...prev, ...responseData.friend_lists]);
          setCursor(responseData.pagination.next_cursor);
          setHasNext(responseData.pagination.has_next);
        }
      }
    } catch (error) {
      console.error("Failed to load more friends:", error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message={commonT("loading")} size="md" />;
  }

  // 错误状态 - 检查是否是404错误（空数据）
  if (error && error.status !== 404) {
    return (
      <ErrorDisplay
        title={commonT("loadFailed")}
        message={commonT("loadFailedMessage")}
        type="error"
        showReload={true}
      />
    );
  }

  // 检查是否所有友链都为空
  const hasFeaturedFriends = featuredFriends && featuredFriends.length > 0;
  const hasNormalFriends = normalFriends && normalFriends.length > 0;
  const hasAnyFriends = hasFeaturedFriends || hasNormalFriends;

  // 如果数据已加载完成且所有友链都为空，显示统一的空状态
  // 判断条件：
  // 1. 不在加载中
  // 2. allFriends 为空数组
  // 3. 数据已经处理过（要么有 error，要么 friendLists 已经返回）
  const dataLoaded = !isLoading && (error !== undefined || friendLists !== undefined);
  const isEmpty = allFriends.length === 0 && !hasAnyFriends;

  if (dataLoaded && isEmpty) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <EmptyState
          icon={Globe}
          title={friendT("noFriendsYet")}
          description={friendT("beFirstToAddFriend")}
          variant="default"
        />
      </motion.div>
    );
  }

  // 友链项目组件
  const FriendItemComponent = ({
    friend,
    variant,
    index,
  }: {
    friend: GetFriendListItemsResponse;
    variant: "featured" | "default";
    index: number;
  }) => (
    <motion.div
      key={friend.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="h-full"
    >
      <Link
        href={friend.site_url}
        target="_blank"
        rel="noopener noreferrer"
        className="block h-full"
      >
        <motion.div
          className={`h-full cursor-pointer rounded-sm p-5 transition-[border-color,box-shadow,transform] duration-300 ${
            variant === "featured"
              ? "bg-card-100 border border-border-100 shadow-lg"
              : "bg-card-100 border border-border-100 shadow-sm"
          } hover:shadow-xl hover:scale-[1.01] hover:-translate-y-1 active:scale-[0.99]`}
        >
          <div className="flex flex-col h-full">
            {/* Logo和标题区域 */}
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 rounded-sm overflow-hidden bg-card-200 flex items-center justify-center shadow-sm shrink-0">
                {friend.logo_url && !imageErrors.has(friend.id) ? (
                  <Image
                    src={friend.logo_url}
                    alt={friend.title}
                    width={48}
                    height={48}
                    className="object-cover w-full h-full"
                    onError={() => {
                      setImageErrors((prev) => new Set(prev).add(friend.id));
                    }}
                  />
                ) : (
                  <Globe className="w-6 h-6 text-foreground-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h3 className="text-lg font-semibold text-foreground-50 truncate">
                    {friend.title}
                  </h3>
                  {variant === "featured" && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current shrink-0" />
                  )}
                </div>
              </div>
              <ExternalLink className="w-4 h-4 text-primary-500 shrink-0" />
            </div>

            {/* 描述区域 */}
            {friend.description && (
              <p className="text-foreground-300 text-sm mb-4 line-clamp-3 flex-1">
                {friend.description}
              </p>
            )}

            {/* URL区域 */}
            <div className="mt-auto">
              <div className="flex items-center text-xs text-foreground-400">
                <Globe className="w-3 h-3 mr-1 shrink-0" />
                <span className="truncate">{friend.site_url.replace(/^https?:\/\//, "")}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  );

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* 精选友链 */}
      {hasFeaturedFriends && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center space-x-2 mb-6">
            <Star className="w-5 h-5 text-yellow-500 fill-current" />
            <h2 className="text-xl font-semibold text-foreground-50">
              {friendT("featuredFriends")}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {featuredFriends.map((friend, index) => (
                <FriendItemComponent
                  key={friend.id}
                  friend={friend}
                  variant="featured"
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* 普通友链 */}
      {hasNormalFriends && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center space-x-2 mb-6">
            <Globe className="w-5 h-5 text-foreground-400" />
            <h2 className="text-xl font-semibold text-foreground-50">{friendT("normalFriends")}</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {normalFriends.map((friend, index) => (
                <FriendItemComponent
                  key={friend.id}
                  friend={friend}
                  variant="default"
                  index={index}
                />
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}

      {/* 加载更多按钮 */}
      {hasNext && (
        <motion.div
          className="text-center py-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Button
              onClick={handleLoadMore}
              disabled={isLoadingMore}
              loading={isLoadingMore}
              loadingText={commonT("loading")}
              variant="primary"
              size="md"
              className="mx-auto"
            >
              {friendT("loadMoreFriends")}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default FriendLinkList;
