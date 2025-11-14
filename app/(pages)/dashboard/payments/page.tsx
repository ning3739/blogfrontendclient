"use client";

import React, { useState } from "react";
import { Search, CreditCard, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import useSWR from "swr";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations, useFormatter } from "next-intl";
import { formatCurrency } from "@/app/lib/utils/handleCurrencyFormat";
import PaymentLists from "@/app/components/(feature)/dashboard/payment/PaymentLists";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import EmptyState from "@/app/components/ui/error/EmptyState";
import StatsCard from "@/app/components/ui/stats/StatsCard";

export default function PaymentsPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const searchParams = useSearchParams();
  const type = searchParams.get("type") as "admin" | "user" | null;
  const locale = useLocale();
  const format = useFormatter();
  const commonT = useTranslations("common");
  const dashboardT = useTranslations("dashboard.payments");

  // 确保type参数有效，默认为user
  const userType = type === "admin" ? "admin" : "user";

  const {
    data: paymentRecords,
    isLoading,
    error,
    mutate,
  } = useSWR([
    `/payment/get-payment-records?page=${currentPage}&size=10`,
    locale,
  ]);

  if (isLoading) {
    return (
      <LoadingSpinner
        message={commonT("loading")}
        size="md"
        variant="wave"
        fullScreen={true}
      />
    );
  }

  if (error && error.status !== 404) {
    return (
      <ErrorDisplay
        title={commonT("loadFailed")}
        message={commonT("loadFailedMessage")}
        type="error"
      />
    );
  }

  // Handle case where paymentRecords is undefined (404 or no data)
  // The API returns an object: { items: [], pagination: {} }
  const hasData =
    paymentRecords && paymentRecords.items && paymentRecords.pagination;

  // Default values for empty state
  const { items: paymentItems, pagination } = hasData
    ? paymentRecords
    : {
        items: [],
        pagination: {
          total_count: 0,
          new_items_this_month: 0,
          total_amount_this_month: 0,
        },
      };

  // Stats data configuration
  const statsData = [
    {
      title: userType === "admin" ? "支付记录总数" : dashboardT("total"),
      value: pagination?.total_count || 0,
      icon: Search,
      iconBgColor: "bg-primary-50",
      iconColor: "text-primary-500",
      delay: 0.1,
    },
    {
      title:
        userType === "admin" ? "本月新增" : dashboardT("newItemsThisMonth"),
      value: pagination?.new_items_this_month || 0,
      icon: CreditCard,
      iconBgColor: "bg-success-50",
      iconColor: "text-success-500",
      delay: 0.2,
    },
    {
      title:
        userType === "admin"
          ? "本月总金额"
          : dashboardT("totalAmountThisMonth"),
      value: formatCurrency(
        pagination?.total_amount_this_month || 0,
        format,
        "NZD"
      ),
      icon: TrendingUp,
      iconBgColor: "bg-info-50",
      iconColor: "text-info-500",
      delay: 0.3,
    },
  ];

  return (
    <div className="min-h-screen bg-background-50">
      {/* Header Section */}
      <div className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground-50 mb-1 sm:mb-2">
          {userType === "admin" ? "支付记录管理" : dashboardT("title")}
        </h1>
        <p className="text-sm sm:text-base text-foreground-300">
          {userType === "admin"
            ? "管理所有用户的支付记录和状态。"
            : dashboardT("description")}
        </p>
      </div>

      {/* Payment Stats */}
      <div className="px-4 sm:px-6 pb-4 sm:pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
          {statsData.map((stat) => (
            <StatsCard
              key={stat.title}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              iconBgColor={stat.iconBgColor}
              iconColor={stat.iconColor}
              delay={stat.delay}
            />
          ))}
        </div>
      </div>

      {/* Payment Table */}
      {paymentItems && paymentItems.length > 0 ? (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card-50 border border-border-50 rounded-sm p-3 sm:p-4 lg:p-6"
          >
            <PaymentLists
              type={userType}
              paymentRecords={paymentItems}
              pagination={pagination}
              setCurrentPage={setCurrentPage}
              onDataChange={() => mutate()}
            />
          </motion.div>
        </div>
      ) : (
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          <EmptyState
            icon={CreditCard}
            title={
              userType === "admin" ? "暂无支付记录" : dashboardT("noPayments")
            }
            description={
              userType === "admin"
                ? "目前还没有支付记录"
                : dashboardT("noPaymentsDescription")
            }
          />
        </div>
      )}
    </div>
  );
}
