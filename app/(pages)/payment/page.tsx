"use client";

import useSWR from "swr";
import Image from "next/image";
import { ArrowLeft, FileX } from "lucide-react";
import { useTranslations, useFormatter } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/button/butten";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import EmptyState from "@/app/components/ui/error/EmptyState";
import { formatCurrency } from "@/app/lib/utils/handleCurrencyFormat";
import PaymentElement from "@/app/components/(feature)/payment/PaymentElement";

export default function PaymentPage() {
  const router = useRouter();
  const commonT = useTranslations("common");
  const format = useFormatter();
  const searchParams = useSearchParams();
  const projectSlug = searchParams.get("projectSlug");

  const {
    data: projectDetails,
    isLoading,
    error,
  } = useSWR(`/project/get-project-details/${projectSlug}`);

  if (isLoading)
    return <LoadingSpinner message={commonT("loading")} size="md" />;

  if (error)
    return (
      <ErrorDisplay
        title={commonT("loadFailed")}
        message={commonT("loadFailedMessage")}
        type="error"
        showReload
      />
    );

  return (
    <div className="min-h-screen bg-background-50">
      {!projectDetails ? (
        <div className="flex items-center justify-center min-h-screen p-6">
          <EmptyState
            icon={FileX}
            title={commonT("notFound")}
            description={commonT("notFoundMessage")}
            iconBgColor="bg-primary-50"
            iconColor="text-primary-500"
          />
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row min-h-screen">
          {/* 左侧：支付信息 */}
          <div className="w-full lg:w-1/2 border-b lg:border-b-0 lg:border-r border-border-50 rounded-sm overflow-hidden relative">
            {/* 局部背景效果 */}
            <div className="absolute inset-0 z-0">
              <div className="absolute inset-0 opacity-3">
                <div className="w-full h-full bg-linear-to-r from-transparent via-transparent to-transparent bg-size-[32px_32px] bg-[repeating-linear-gradient(0deg,currentColor_0px,currentColor_1px,transparent_1px,transparent_32px),repeating-linear-gradient(90deg,currentColor_0px,currentColor_1px,transparent_1px,transparent_32px)]" />
              </div>
              {/* 添加渐变遮罩增强质感 */}
              <div className="absolute inset-0 bg-linear-to-br from-background-50/3 via-transparent to-primary-50/10 pointer-events-none" />
            </div>
            <div className="relative z-10 p-6 flex flex-col h-full">
              {/* 返回按钮 */}
              <div className="mb-6 h-10 flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    projectSlug
                      ? router.push(`/projects/${projectSlug}`)
                      : router.back()
                  }
                  className="flex items-center gap-2 transition-colors duration-200 border-border-100 text-foreground-200 bg-background-200 hover:bg-background-300 hover:border-border-200"
                >
                  <ArrowLeft className="w-4 h-4" />
                  返回
                </Button>
              </div>

              {/* 内容区域 */}
              <div className="flex-1 max-w-md mx-auto lg:mr-8 w-full flex flex-col">
                <h2 className="text-2xl font-semibold mb-4 text-foreground-50">
                  支付信息
                </h2>

                {/* 项目信息摘要 */}
                <div className="mb-6">
                  <div className="text-lg font-medium text-foreground-50 mb-2">
                    {projectDetails.project_name}
                  </div>

                  {projectDetails.cover_url && (
                    <div className="mb-3">
                      <Image
                        src={projectDetails.cover_url}
                        alt={projectDetails.project_name}
                        width={400}
                        height={224}
                        className="w-full h-56 object-cover rounded-sm"
                        priority
                      />
                    </div>
                  )}

                  <p className="text-sm text-foreground-300 line-clamp-3">
                    {projectDetails.project_description}
                  </p>
                </div>

                {/* 支付摘要 */}
                <div className="bg-background-50 p-4 rounded-sm border border-border-100">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground-300">项目名称</span>
                      <span className="text-foreground-50 font-medium truncate ml-2">
                        {projectDetails.project_name}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground-300">价格</span>
                      <span className="text-foreground-50">
                        {formatCurrency(
                          projectDetails.project_price,
                          format,
                          "NZD"
                        )}
                      </span>
                    </div>
                    {projectDetails.tax_rate > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-foreground-300">
                          {projectDetails.tax_name || "税费"} (
                          {projectDetails.tax_rate}%)
                        </span>
                        <span className="text-foreground-50">
                          {formatCurrency(
                            projectDetails.tax_amount,
                            format,
                            "NZD"
                          )}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-border-100 pt-2">
                      <div className="flex justify-between text-lg font-semibold">
                        <span className="text-foreground-50">总计</span>
                        <span className="text-primary-500">
                          {formatCurrency(
                            projectDetails.final_amount,
                            format,
                            "NZD"
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：支付表单区域 */}
          <div className="w-full lg:w-1/2 p-6 flex flex-col border-t lg:border-t-0 lg:border-l border-border-50 bg-background-50 rounded-sm">
            {/* 占位区域保持对齐 */}
            <div className="mb-6 h-10" />

            {/* 标题部分 */}
            <div className="flex flex-col max-w-md mx-auto lg:ml-8 w-full">
              <h2 className="text-2xl font-semibold mb-3 text-foreground-50">
                完成支付
              </h2>
              <p className="text-base text-foreground-200 mb-6">
                请填写您的支付信息以完成订单
              </p>

              {/* 支付表单 */}
              <div className="flex-1 flex flex-col">
                <PaymentElement
                  project_id={projectDetails.project_id}
                  cover_url={projectDetails.cover_url}
                  project_name={projectDetails.project_name}
                  project_description={projectDetails.project_description}
                  project_price={projectDetails.project_price}
                  tax_name={projectDetails.tax_name}
                  tax_rate={projectDetails.tax_rate}
                  tax_amount={projectDetails.tax_amount}
                  final_amount={projectDetails.final_amount}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
