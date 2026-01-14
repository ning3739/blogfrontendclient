"use client";

import { Briefcase, DollarSign, FileText, Image, Users } from "lucide-react";
import { motion } from "motion/react";
import { useFormatter } from "next-intl";
import useSWR from "swr";
import DistributionChart from "@/app/components/(feature)/dashboard/admin/analytics/DistributionChart";
import GrowthChart from "@/app/components/(feature)/dashboard/admin/analytics/GrowthChart";
import RevenueProjectList from "@/app/components/(feature)/dashboard/admin/analytics/RevenueProjectList";
import TagCloud from "@/app/components/(feature)/dashboard/admin/analytics/TagCloud";
import TopPerformersChart from "@/app/components/(feature)/dashboard/admin/analytics/TopPerformersChart";
import UserLocationMap from "@/app/components/(feature)/dashboard/admin/analytics/UserLocationMap";
import StatsCard from "@/app/components/ui/stats/StatsCard";
import { formatCurrency } from "@/app/lib/utils/handleCurrencyFormat";
import type {
  BlogStatistics,
  BlogTopPerformers,
  GrowthTrends,
  MediaStatistics,
  OverviewStatistics,
  PaymentStatistics,
  ProjectStatistics,
  RevenueProject,
  TagStatistic,
  UserLocation,
  UserStatistics,
} from "@/app/types/analyticServiceType";

export default function AnalyticsPage() {
  const format = useFormatter();

  const { data: overview } = useSWR<OverviewStatistics>("/analytic/admin/overview");

  const { data: userStats } = useSWR<UserStatistics>("/analytic/admin/user-statistics");

  const {
    data: userLocations,
    isLoading: locationLoading,
    error: locationError,
  } = useSWR<UserLocation[]>("/analytic/admin/user-location");

  const {
    data: blogStats,
    isLoading: blogStatsLoading,
    error: blogStatsError,
  } = useSWR<BlogStatistics>("/analytic/admin/blog-statistics");

  const {
    data: blogPerformers,
    isLoading: blogPerformersLoading,
    error: blogPerformersError,
  } = useSWR<BlogTopPerformers>("/analytic/admin/top-ten-blog-performers");

  const {
    data: tags,
    isLoading: tagsLoading,
    error: tagsError,
  } = useSWR<TagStatistic[]>("/analytic/admin/tag-statistics?limit=20");

  const {
    data: projectStats,
    isLoading: projectStatsLoading,
    error: projectStatsError,
  } = useSWR<ProjectStatistics>("/analytic/admin/project-statistics");

  const {
    data: paymentStats,
    isLoading: paymentStatsLoading,
    error: paymentStatsError,
  } = useSWR<PaymentStatistics>("/analytic/admin/payment-statistics");

  const {
    data: revenueProjects,
    isLoading: revenueProjectsLoading,
    error: revenueProjectsError,
  } = useSWR<RevenueProject[]>("/analytic/admin/top-ten-revenue-projects");

  const { data: mediaStats } = useSWR<MediaStatistics>("/analytic/admin/media-statistics");

  const {
    data: growthTrends,
    isLoading: growthTrendsLoading,
    error: growthTrendsError,
  } = useSWR<GrowthTrends>("/analytic/admin/growth-trends?days=30");

  return (
    <div className="min-h-screen bg-linear-to-br from-background-50 via-background-50 to-background-100 w-full overflow-x-hidden">
      <div className="max-w-[1600px] mx-auto">
        {/* Header Section */}
        <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground-50 mb-1 sm:mb-2">
            数据分析
          </h1>
          <p className="text-sm sm:text-base text-foreground-300">实时监控网站运营数据</p>
        </div>

        {/* Stats Overview Cards */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
            <StatsCard
              title="总用户数"
              value={overview?.users.total.toLocaleString() || "0"}
              subtitle={
                userStats
                  ? `活跃: ${userStats.active_users} | 本月新增: ${userStats.new_users_this_month}`
                  : undefined
              }
              icon={Users}
              iconBgColor="bg-blue-50"
              iconColor="text-blue-500"
              delay={0.1}
            />
            <StatsCard
              title="总博客数"
              value={overview?.blogs.total.toLocaleString() || "0"}
              subtitle={
                blogStats
                  ? `已发布: ${blogStats.published_blogs} | 本月新增: ${blogStats.new_blogs_this_month}`
                  : undefined
              }
              icon={FileText}
              iconBgColor="bg-green-50"
              iconColor="text-green-500"
              delay={0.2}
            />
            <StatsCard
              title="总项目数"
              value={overview?.projects.total.toLocaleString() || "0"}
              subtitle={
                projectStats
                  ? `已发布: ${projectStats.published_projects} | 本月新增: ${projectStats.new_projects_this_month}`
                  : undefined
              }
              icon={Briefcase}
              iconBgColor="bg-purple-50"
              iconColor="text-purple-500"
              delay={0.3}
            />
            <StatsCard
              title="总收入"
              value={formatCurrency(overview?.payments.total_revenue || 0, format, "NZD")}
              subtitle={
                paymentStats
                  ? `本月: ${formatCurrency(
                      paymentStats.monthly_revenue,
                      format,
                      "NZD",
                    )} | 本年: ${formatCurrency(paymentStats.yearly_revenue, format, "NZD")}`
                  : undefined
              }
              icon={DollarSign}
              iconBgColor="bg-orange-50"
              iconColor="text-orange-500"
              delay={0.4}
            />
            <StatsCard
              title="媒体文件"
              value={overview?.media.total.toLocaleString() || "0"}
              subtitle={
                mediaStats
                  ? `头像: ${mediaStats.avatar_count} | 本月新增: ${mediaStats.new_media_this_month}`
                  : undefined
              }
              icon={Image}
              iconBgColor="bg-pink-50"
              iconColor="text-pink-500"
              delay={0.5}
            />
          </div>
        </div>

        {/* Growth Trends Section */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <GrowthChart
              data={growthTrends}
              isLoading={growthTrendsLoading}
              error={growthTrendsError}
            />
          </motion.div>
        </div>

        {/* User Analytics Section */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="mb-4"
          >
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground-50 mb-1">用户分析</h2>
            <p className="text-sm text-foreground-300">
              用户地理位置分布
              {userStats && (
                <span className="ml-2 text-foreground-200">
                  (总用户: {userStats.total_users} | 活跃用户: {userStats.active_users})
                </span>
              )}
            </p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <UserLocationMap
              locations={userLocations}
              isLoading={locationLoading}
              error={locationError}
            />
          </motion.div>
        </div>

        {/* Blog Analytics Section */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="mb-4"
          >
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground-50 mb-1">博客分析</h2>
            <p className="text-sm text-foreground-300">
              博客表现与互动数据
              {blogStats && (
                <span className="ml-2 text-foreground-200">
                  (精选: {blogStats.featured_blogs} | 归档: {blogStats.archived_blogs} | 本月更新:{" "}
                  {blogStats.updated_blogs_this_month})
                </span>
              )}
            </p>
          </motion.div>

          {/* Top Performers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0 }}
            >
              <TopPerformersChart
                title="浏览量前十博客"
                data={
                  blogPerformers
                    ? blogPerformers.top_views.map((item) => ({
                        title: item.title,
                        value: item.views || 0,
                        blog_slug: item.blog_slug,
                        section_slug: item.section_slug,
                      }))
                    : undefined
                }
                dataKey="views"
                color="#3B82F6"
                isLoading={blogPerformersLoading}
                error={blogPerformersError}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <TopPerformersChart
                title="点赞数前十博客"
                data={
                  blogPerformers
                    ? blogPerformers.top_likes.map((item) => ({
                        title: item.title,
                        value: item.likes || 0,
                        blog_slug: item.blog_slug,
                        section_slug: item.section_slug,
                      }))
                    : undefined
                }
                dataKey="likes"
                color="#10B981"
                isLoading={blogPerformersLoading}
                error={blogPerformersError}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.15 }}
            >
              <TopPerformersChart
                title="评论数前十博客"
                data={
                  blogPerformers
                    ? blogPerformers.top_comments.map((item) => ({
                        title: item.title,
                        value: item.comments || 0,
                        blog_slug: item.blog_slug,
                        section_slug: item.section_slug,
                      }))
                    : undefined
                }
                dataKey="comments"
                color="#F59E0B"
                isLoading={blogPerformersLoading}
                error={blogPerformersError}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <TopPerformersChart
                title="收藏数前十博客"
                data={
                  blogPerformers
                    ? blogPerformers.top_saves.map((item) => ({
                        title: item.title,
                        value: item.saves || 0,
                        blog_slug: item.blog_slug,
                        section_slug: item.section_slug,
                      }))
                    : undefined
                }
                dataKey="saves"
                color="#EF4444"
                isLoading={blogPerformersLoading}
                error={blogPerformersError}
              />
            </motion.div>
          </div>

          {/* Blog Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.25 }}
            >
              <DistributionChart
                title="博客栏目分布"
                data={
                  blogStats
                    ? blogStats.section_distribution.map((item) => ({
                        name: item.section,
                        value: item.count,
                      }))
                    : undefined
                }
                isLoading={blogStatsLoading}
                error={blogStatsError}
              />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
            >
              <DistributionChart
                title="博客互动统计"
                data={
                  blogStats
                    ? [
                        { name: "浏览量", value: blogStats.total_views },
                        { name: "点赞数", value: blogStats.total_likes },
                        { name: "评论数", value: blogStats.total_comments },
                        { name: "收藏数", value: blogStats.total_saves },
                      ]
                    : undefined
                }
                isLoading={blogStatsLoading}
                error={blogStatsError}
              />
            </motion.div>
          </div>

          {/* Tag Cloud */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.35 }}
          >
            <TagCloud tags={tags} isLoading={tagsLoading} error={tagsError} />
          </motion.div>
        </div>

        {/* Project Analytics Section */}
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.4 }}
            className="mb-4"
          >
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground-50 mb-1">项目分析</h2>
            <p className="text-sm text-foreground-300">项目类型与收入数据</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.45 }}
            >
              <DistributionChart
                title="项目类型分布"
                data={
                  projectStats
                    ? Object.entries(projectStats.type_distribution).map(([name, value]) => ({
                        name,
                        value,
                      }))
                    : undefined
                }
                isLoading={projectStatsLoading}
                error={projectStatsError}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5 }}
            >
              <DistributionChart
                title="项目栏目分布"
                data={
                  projectStats
                    ? projectStats.section_distribution.map((item) => ({
                        name: item.section,
                        value: item.count,
                      }))
                    : undefined
                }
                isLoading={projectStatsLoading}
                error={projectStatsError}
              />
            </motion.div>
          </div>

          {/* 只在有收入项目数据时显示 */}
          {revenueProjects && revenueProjects.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.55 }}
            >
              <RevenueProjectList
                projects={revenueProjects}
                isLoading={revenueProjectsLoading}
                error={revenueProjectsError}
              />
            </motion.div>
          )}
        </div>

        {/* Payment Analytics Section - 只在有支付数据时显示 */}
        {paymentStats && paymentStats.total_payments > 0 && (
          <div className="px-4 sm:px-6 pb-4 sm:pb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.6 }}
              className="mb-4"
            >
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground-50 mb-1">
                支付分析
              </h2>
              <p className="text-sm text-foreground-300">
                支付方式与状态统计
                <span className="ml-2 text-foreground-200">
                  (总支付: {paymentStats.total_payments} | 成功支付:{" "}
                  {paymentStats.successful_payments} | 总税费:{" "}
                  {formatCurrency(paymentStats.total_tax, format, "NZD")})
                </span>
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 lg:gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.65 }}
              >
                <DistributionChart
                  title="支付方式分布"
                  data={Object.entries(paymentStats.payment_type_distribution).map(
                    ([name, value]) => ({
                      name,
                      value,
                    }),
                  )}
                  isLoading={paymentStatsLoading}
                  error={paymentStatsError}
                />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.7 }}
              >
                <DistributionChart
                  title="支付状态分布"
                  data={Object.entries(paymentStats.payment_status_distribution).map(
                    ([name, value]) => ({
                      name: name === "success" ? "成功" : name === "failed" ? "失败" : "取消",
                      value,
                    }),
                  )}
                  colors={["#10B981", "#EF4444", "#F59E0B"]}
                  isLoading={paymentStatsLoading}
                  error={paymentStatsError}
                />
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
