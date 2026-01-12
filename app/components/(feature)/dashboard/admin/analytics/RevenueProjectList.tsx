"use client";

import Link from "next/link";
import { useFormatter } from "next-intl";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import { formatCurrency } from "@/app/lib/utils/handleCurrencyFormat";
import type { RevenueProject } from "@/app/types/analyticServiceType";

interface RevenueProjectListProps {
  projects?: RevenueProject[];
  isLoading?: boolean;
  error?: unknown;
}

export default function RevenueProjectList({
  projects,
  isLoading,
  error,
}: RevenueProjectListProps) {
  const format = useFormatter();
  if (isLoading) {
    return <LoadingSpinner message="加载收入项目..." size="sm" variant="pulse" />;
  }

  if (error || !projects) {
    return (
      <ErrorDisplay
        title="收入项目加载失败"
        message="无法加载收入项目数据"
        type="warning"
        className="min-h-0 bg-transparent border-0"
      />
    );
  }
  return (
    <div className="bg-card-50 border border-border-50 rounded-sm p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow w-full max-w-full overflow-hidden">
      <h3 className="text-lg sm:text-xl font-semibold text-foreground-50 mb-5">收入前十项目</h3>
      <div className="space-y-2 w-full max-h-[400px] overflow-y-auto pr-1">
        {projects.map((project, index) => (
          <Link
            key={project.project_slug}
            href={`/projects/${project.project_slug}`}
            className="flex items-center justify-between p-3 sm:p-4 rounded-sm bg-background-50 hover:bg-background-100 hover:shadow-sm transition-[background-color,box-shadow] w-full group"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0 overflow-hidden">
              <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-100 text-primary-600 font-bold text-sm shrink-0 group-hover:bg-primary-200 transition-colors">
                {index + 1}
              </span>
              <div className="flex-1 min-w-0 overflow-hidden">
                <p className="font-semibold text-foreground-50 truncate text-sm sm:text-base group-hover:text-primary-500 transition-colors">
                  {project.title}{" "}
                  <span className="text-xs sm:text-sm text-foreground-400 truncate mt-0.5">
                    ({project.payment_count} 次购买)
                  </span>
                </p>
              </div>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className="font-bold text-success-500 text-base sm:text-lg whitespace-nowrap">
                {formatCurrency(project.total_revenue, format, "NZD")}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
