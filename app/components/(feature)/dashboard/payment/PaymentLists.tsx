"use client";

import { Download, Eye } from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import type React from "react";
import { useState } from "react";
import OffsetPagination from "@/app/components/ui/pagination/OffsetPagination";
import mediaService from "@/app/lib/services/mediaService";
import { formatCurrency } from "@/app/lib/utils/handleCurrencyFormat";
import { handleDateFormat } from "@/app/lib/utils/handleDateFormat";
import type { OffsetPaginationResponse } from "@/app/types/commonType";
import type { GetPaymentRecordsItems } from "@/app/types/paymentServiceType";
import PaymentDetailModel from "./PaymentDetailModel";

interface PaymentListsProps {
  type: "admin" | "user";
  paymentRecords: GetPaymentRecordsItems[];
  pagination: OffsetPaginationResponse;
  setCurrentPage: (page: number) => void;
  onDataChange?: () => void; // Optional callback for data refresh
}

const PaymentLists: React.FC<PaymentListsProps> = ({
  type,
  paymentRecords,
  pagination,
  setCurrentPage,
}) => {
  const dashboardT = useTranslations("dashboard.payments");
  const commonT = useTranslations("common");
  const _locale = useLocale();
  const format = useFormatter();
  const router = useRouter();
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedPaymentRecord, setSelectedPaymentRecord] = useState<GetPaymentRecordsItems | null>(
    null,
  );

  // 处理查看详情点击
  const handleViewDetails = (record: GetPaymentRecordsItems) => {
    setSelectedPaymentRecord(record);
    setIsDetailModalOpen(true);
  };

  // 关闭详情模态框
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedPaymentRecord(null);
  };

  // 处理项目标题点击，跳转到项目详情页
  const handleProjectClick = (slug: string) => {
    router.push(`/projects/${slug}`);
  };

  // 处理下载项目附件
  const handleDownload = async (record: GetPaymentRecordsItems) => {
    if (!record.attachment_id) {
      return;
    }

    try {
      await mediaService.downloadMedia({
        media_id: record.attachment_id,
      });
    } catch (error) {
      console.error("下载失败:", error);
    }
  };

  // 获取支付状态样式
  const getStatusStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "text-success-500 font-bold text-sm";
      case "failed":
        return "bg-error-500 text-white border-error-500 shadow-lg font-semibold";
      case "cancel":
        return "bg-warning-500 text-white border-warning-500 shadow-lg font-semibold";
      default:
        return "bg-background-200 text-foreground-400 border-border-100";
    }
  };

  // 获取支付状态文本
  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return type === "admin" ? "支付成功" : dashboardT("paymentSuccess");
      case "failed":
        return type === "admin" ? "支付失败" : dashboardT("paymentFailed");
      case "cancel":
        return type === "admin" ? "支付取消" : dashboardT("paymentCanceled");
      default:
        return status;
    }
  };

  return (
    <div className="w-full">
      {/* 桌面表格视图 */}
      <div className="hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-50">
                <th className="text-left py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  {type === "admin" ? "订单号" : dashboardT("orderNumber")}
                </th>
                <th className="text-left py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  {type === "admin" ? "项目名称" : dashboardT("projectTitle")}
                </th>
                <th className="text-left py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  {type === "admin" ? "金额" : dashboardT("amount")}
                </th>
                <th className="text-center py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  {type === "admin" ? "支付状态" : dashboardT("paymentStatus")}
                </th>
                <th className="text-left py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  {type === "admin" ? "支付时间" : dashboardT("paymentTime")}
                </th>
                <th className="text-right py-4 px-3 lg:px-4 text-sm font-semibold text-foreground-200">
                  {type === "admin" ? "操作" : commonT("actions")}
                </th>
              </tr>
            </thead>
            <tbody>
              {paymentRecords.map((record, index) => (
                <motion.tr
                  key={record.payment_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-border-50 hover:bg-background-100 transition-colors bg-background-50"
                >
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs lg:text-sm font-medium text-foreground-50 truncate">
                        {record.order_number}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <div className="min-w-0 flex-1">
                      <button
                        type="button"
                        onClick={() => handleProjectClick(record.project?.project_slug)}
                        className="text-xs lg:text-sm text-foreground-50 hover:text-primary-500 truncate transition-colors text-left"
                        disabled={!record.project?.project_slug}
                      >
                        {record.project?.project_title || "未知项目"}
                      </button>
                    </div>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <p className="text-xs lg:text-sm font-semibold text-primary-600">
                      {formatCurrency(record.amount, format, "NZD")}
                    </p>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-4 text-center">
                    {record.payment_status.toLowerCase() === "success" ? (
                      <span className={`${getStatusStyle(record.payment_status)}`}>
                        {getStatusText(record.payment_status)}
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium border ${getStatusStyle(
                          record.payment_status,
                        )}`}
                      >
                        {getStatusText(record.payment_status)}
                      </span>
                    )}
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <p className="text-xs lg:text-sm text-foreground-200">
                      {handleDateFormat(record.created_at, format)}
                    </p>
                  </td>
                  <td className="py-3 lg:py-4 px-3 lg:px-4">
                    <div className="flex justify-end space-x-1 lg:space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleViewDetails(record)}
                        className="p-1.5 lg:p-2 bg-primary-50 text-primary-400 rounded-sm hover:bg-primary-100 transition-colors"
                        title="查看详情"
                      >
                        <Eye className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                      </motion.button>
                      {record.payment_status.toLowerCase() === "success" && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleDownload(record)}
                          className="p-1.5 lg:p-2 bg-success-50 text-success-400 hover:bg-success-100 rounded-sm transition-colors"
                          title="下载项目文件"
                        >
                          <Download className="w-3.5 h-3.5 lg:w-4 lg:h-4" />
                        </motion.button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 平板视图 */}
      <div className="hidden md:block lg:hidden">
        <div className="space-y-3">
          {paymentRecords.map((record, index) => (
            <motion.div
              key={record.payment_id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-border-50 rounded-sm p-4 hover:shadow-md transition-shadow bg-background-50"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground-50 truncate flex-1">
                    {record.order_number}
                  </h3>
                  {record.payment_status.toLowerCase() === "success" ? (
                    <span className={`${getStatusStyle(record.payment_status)}`}>
                      {getStatusText(record.payment_status)}
                    </span>
                  ) : (
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium border ${getStatusStyle(
                        record.payment_status,
                      )}`}
                    >
                      {getStatusText(record.payment_status)}
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs text-foreground-300">
                    {type === "admin" ? "项目名称" : dashboardT("projectTitle")}:{" "}
                    <button
                      type="button"
                      onClick={() => handleProjectClick(record.project?.project_slug)}
                      className="text-foreground-50 hover:text-primary-500 transition-colors"
                      disabled={!record.project?.project_slug}
                    >
                      {record.project?.project_title || "未知项目"}
                    </button>
                  </p>
                  <p className="text-xs text-foreground-300">
                    {type === "admin" ? "金额" : dashboardT("amount")}:{" "}
                    {formatCurrency(record.amount, format, "NZD")}
                  </p>
                  <p className="text-xs text-foreground-400">
                    {type === "admin" ? "支付时间" : dashboardT("paymentTime")}:{" "}
                    {handleDateFormat(record.created_at, format)}
                  </p>
                </div>

                <div className="flex justify-end space-x-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleViewDetails(record)}
                    className="p-1.5 bg-primary-50 text-primary-400 rounded-sm hover:bg-primary-100 transition-colors"
                    title="查看详情"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </motion.button>
                  {record.payment_status.toLowerCase() === "success" && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDownload(record)}
                      className="p-1.5 bg-success-50 text-success-400 hover:bg-success-100 rounded-sm transition-colors"
                      title="下载项目文件"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* 移动端卡片视图 */}
      <div className="md:hidden space-y-3">
        {paymentRecords.map((record, index) => (
          <motion.div
            key={record.payment_id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="border border-border-50 rounded-sm p-3 hover:shadow-md transition-shadow bg-background-50"
          >
            <div className="space-y-2.5">
              {/* 订单头部 */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-foreground-50 truncate flex-1">
                  {record.order_number}
                </h3>
                {record.payment_status.toLowerCase() === "success" ? (
                  <span className={`${getStatusStyle(record.payment_status)}`}>
                    {getStatusText(record.payment_status)}
                  </span>
                ) : (
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-sm text-xs font-medium border ${getStatusStyle(
                      record.payment_status,
                    )}`}
                  >
                    {getStatusText(record.payment_status)}
                  </span>
                )}
              </div>

              {/* 详细信息 */}
              <div className="space-y-1">
                <p className="text-xs text-foreground-300">
                  {type === "admin" ? "项目名称" : dashboardT("projectTitle")}:{" "}
                  <button
                    type="button"
                    onClick={() => handleProjectClick(record.project?.project_slug)}
                    className="text-foreground-50 hover:text-primary-500 transition-colors"
                    disabled={!record.project?.project_slug}
                  >
                    {record.project?.project_title || "未知项目"}
                  </button>
                </p>
                <p className="text-xs text-foreground-300">
                  {type === "admin" ? "金额" : dashboardT("amount")}:{" "}
                  {formatCurrency(record.amount, format, "NZD")}
                </p>
                <p className="text-xs text-foreground-400">
                  {type === "admin" ? "支付时间" : dashboardT("paymentTime")}:{" "}
                  {handleDateFormat(record.created_at, format)}
                </p>
              </div>

              {/* 操作 */}
              <div className="flex justify-end -mr-1">
                <div className="flex space-x-1">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleViewDetails(record)}
                    className="p-1.5 bg-primary-50 text-primary-400 rounded-sm hover:bg-primary-100 transition-colors active:bg-primary-100"
                    title="查看详情"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </motion.button>
                  {record.payment_status.toLowerCase() === "success" && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDownload(record)}
                      className="p-1.5 bg-success-50 text-success-400 hover:bg-success-100 active:bg-success-100 rounded-sm transition-colors"
                      title="下载项目文件"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* 分页 */}
      {paymentRecords.length > 0 && (
        <div className="mt-6">
          <OffsetPagination
            pagination={pagination}
            onPageChange={(page) => {
              setCurrentPage(page);
            }}
          />
        </div>
      )}

      {/* 支付详情模态框 */}
      <PaymentDetailModel
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        paymentRecord={selectedPaymentRecord}
        type={type}
      />
    </div>
  );
};

export default PaymentLists;
