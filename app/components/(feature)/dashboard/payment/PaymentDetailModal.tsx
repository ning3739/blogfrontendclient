"use client";

import {
  Ban,
  Calendar,
  CheckCircle,
  CreditCard,
  DollarSign,
  Package,
  User,
  XCircle,
} from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import type React from "react";
import BaseModal from "@/app/components/ui/modal/BaseModal";
import { formatCurrency } from "@/app/lib/utils/handleCurrencyFormat";
import { handleDateFormat } from "@/app/lib/utils/handleDateFormat";
import type { GetPaymentRecordsItems } from "@/app/types/paymentServiceType";

interface PaymentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentRecord: GetPaymentRecordsItems | null;
  type: "admin" | "user";
}

const PaymentDetailModal: React.FC<PaymentDetailModalProps> = ({
  isOpen,
  onClose,
  paymentRecord,
  type,
}) => {
  const dashboardT = useTranslations("dashboard.payments");
  const format = useFormatter();
  if (!paymentRecord) return null;

  // 获取支付状态样式和图标
  const getStatusInfo = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return {
          text: type === "admin" ? "支付成功" : dashboardT("paymentSuccess"),
          className: "text-success-500 font-bold text-lg",
          icon: CheckCircle,
          iconColor: "text-success-500",
        };
      case "failed":
        return {
          text: type === "admin" ? "支付失败" : dashboardT("paymentFailed"),
          className: "bg-error-500 text-white border-error-500 shadow-lg font-semibold",
          icon: XCircle,
          iconColor: "text-white",
        };
      case "cancel":
        return {
          text: type === "admin" ? "支付取消" : dashboardT("paymentCanceled"),
          className: "bg-warning-500 text-white border-warning-500 shadow-lg font-semibold",
          icon: Ban,
          iconColor: "text-white",
        };
      default:
        return {
          text: status,
          className: "bg-background-200 text-foreground-400 border-border-100",
          icon: Ban,
          iconColor: "text-foreground-400",
        };
    }
  };

  const statusInfo = getStatusInfo(paymentRecord.payment_status);
  const StatusIcon = statusInfo.icon;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title={dashboardT("paymentDetails")}
      size="lg"
      round="sm"
      maxHeight="max-h-[80vh]"
    >
      <div className="space-y-6">
        {/* 订单基本信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground-50 border-b border-border-50 pb-2">
            {type === "admin" ? "订单信息" : dashboardT("orderInfo")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3">
              <CreditCard className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm text-foreground-300">
                  {type === "admin" ? "订单号" : dashboardT("orderNumber")}
                </p>
                <p className="text-base font-medium text-foreground-50">
                  {paymentRecord.order_number}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm text-foreground-300">
                  {type === "admin" ? "金额" : dashboardT("amount")}
                </p>
                <p className="text-base font-semibold text-primary-600">
                  {formatCurrency(paymentRecord.amount, format, "NZD")}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm text-foreground-300">
                  {type === "admin" ? "支付时间" : dashboardT("paymentTime")}
                </p>
                <p className="text-base text-foreground-50">
                  {handleDateFormat(paymentRecord.created_at, format)}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <StatusIcon className={"w-5 h-5 text-primary-500"} />
              <div>
                <p className="text-sm text-foreground-300">
                  {type === "admin" ? "支付状态" : dashboardT("paymentStatus")}
                </p>
                <span
                  className={`inline-flex items-center rounded-sm text-xs font-medium ${statusInfo.className}`}
                >
                  {statusInfo.text}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 用户信息 - 仅admin显示 */}
        {type === "admin" && paymentRecord.user && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground-50 border-b border-border-50 pb-2">
              用户信息
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="text-sm text-foreground-300">用户名</p>
                  <p className="text-base font-medium text-foreground-50">
                    {paymentRecord.user.username}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="text-sm text-foreground-300">邮箱</p>
                  <p className="text-base text-foreground-50">{paymentRecord.user.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-primary-500" />
                <div>
                  <p className="text-sm text-foreground-300">用户ID</p>
                  <p className="text-base text-foreground-50">{paymentRecord.user.user_id}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 项目信息 */}
        {paymentRecord.project && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground-50 border-b border-border-50 pb-2">
              {dashboardT("projectInfo")}
            </h3>

            <div className="flex items-center space-x-3">
              <Package className="w-5 h-5 text-primary-500" />
              <div>
                <p className="text-sm text-foreground-300">
                  {type === "admin" ? "项目名称" : dashboardT("projectTitle")}
                </p>
                <p className="text-base font-medium text-foreground-50">
                  {paymentRecord.project.project_title || "未知项目"}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 支付方式信息 */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-foreground-50 border-b border-border-50 pb-2">
            {type === "admin" ? "支付方式" : dashboardT("paymentMethod")}
          </h3>

          <div className="flex items-center space-x-3">
            <CreditCard className="w-5 h-5 text-primary-500" />
            <div>
              <p className="text-sm text-foreground-300">
                {type === "admin" ? "支付类型" : dashboardT("paymentType")}
              </p>
              <p className="text-base font-medium text-foreground-50">
                {paymentRecord.payment_type || "Stripe"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  );
};

export default PaymentDetailModal;
