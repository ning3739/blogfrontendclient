import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import type { GrowthTrends } from "@/app/types/analyticServiceType";
import { useFormatter } from "next-intl";
import { handleDateFormat } from "@/app/lib/utils/handleDateFormat";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";

interface GrowthChartProps {
  data?: GrowthTrends;
  isLoading?: boolean;
  error?: unknown;
}

export default function GrowthChart({
  data,
  isLoading,
  error,
}: GrowthChartProps) {
  const format = useFormatter();

  if (isLoading) {
    return (
      <LoadingSpinner message="加载增长趋势..." size="sm" variant="pulse" />
    );
  }

  if (error || !data) {
    return (
      <ErrorDisplay
        title="增长趋势加载失败"
        message="无法加载增长趋势数据"
        type="warning"
        className="min-h-0 bg-transparent border-0"
      />
    );
  }

  // 收集所有唯一的日期并合并数据
  const dateMap = new Map<
    string,
    { users: number; blogs: number; revenue: number }
  >();

  // 处理用户增长数据
  data.user_growth?.forEach((item) => {
    const date = item.date;
    if (!dateMap.has(date)) {
      dateMap.set(date, { users: 0, blogs: 0, revenue: 0 });
    }
    dateMap.get(date)!.users = item.count || 0;
  });

  // 处理博客增长数据
  data.blog_growth?.forEach((item) => {
    const date = item.date;
    if (!dateMap.has(date)) {
      dateMap.set(date, { users: 0, blogs: 0, revenue: 0 });
    }
    dateMap.get(date)!.blogs = item.count || 0;
  });

  // 处理收入增长数据
  data.revenue_growth?.forEach((item) => {
    const date = item.date;
    if (!dateMap.has(date)) {
      dateMap.set(date, { users: 0, blogs: 0, revenue: 0 });
    }
    dateMap.get(date)!.revenue = item.revenue || 0;
  });

  // 转换为数组并排序
  const chartData = Array.from(dateMap.entries())
    .map(([date, values]) => ({
      date: handleDateFormat(date, format, "short"),
      rawDate: date,
      ...values,
    }))
    .sort(
      (a, b) => new Date(a.rawDate).getTime() - new Date(b.rawDate).getTime()
    );

  return (
    <div className="bg-card-50 border border-border-50 rounded-sm p-4 sm:p-6 shadow-sm w-full max-w-full overflow-hidden">
      <h3 className="text-base sm:text-lg font-semibold text-foreground-50 mb-4">
        增长趋势
      </h3>
      <div className="w-full max-w-full" style={{ minHeight: "300px" }}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart
            data={chartData}
            margin={{ left: -20, right: 10, top: 5, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--color-border-50)"
              opacity={0.3}
            />
            <XAxis
              dataKey="date"
              stroke="var(--color-foreground-400)"
              style={{ fontSize: "10px" }}
              tick={{ fontSize: 10 }}
            />
            <YAxis
              stroke="var(--color-foreground-400)"
              style={{ fontSize: "10px" }}
              tick={{ fontSize: 10 }}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-card-100)",
                border: "1px solid var(--color-border-50)",
                borderRadius: "4px",
                color: "var(--color-foreground-50)",
                fontSize: "12px",
              }}
            />
            <Legend wrapperStyle={{ fontSize: "11px" }} />
            <Line
              type="monotone"
              dataKey="users"
              stroke="#0ea5e9"
              strokeWidth={2}
              name="新增用户"
              dot={{ fill: "#0ea5e9", r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="blogs"
              stroke="#22c55e"
              strokeWidth={2}
              name="新增博客"
              dot={{ fill: "#22c55e", r: 3 }}
            />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#f59e0b"
              strokeWidth={2}
              name="收入 ($)"
              dot={{ fill: "#f59e0b", r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
