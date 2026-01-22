"use client";

import { ArrowLeft, CheckCircle, Clock, CreditCard, Download, Package, User } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useFormatter, useLocale, useTranslations } from "next-intl";
import useSWR from "swr";
import { Button } from "@/app/components/ui/button/Button";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import LoadingSpinner from "@/app/components/ui/loading/LoadingSpinner";
import { formatCurrency } from "@/app/lib/utils/handleCurrencyFormat";
import type { SupportedLocale } from "@/app/types/clientType";
import type { PaymentSuccessDetails } from "@/app/types/paymentServiceType";

export default function PaymentSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const commonT = useTranslations("common");
  const paymentT = useTranslations("payment.success");
  const locale = useLocale();
  const format = useFormatter();

  const paymentIntent = searchParams.get("payment_intent");
  const redirectStatus = searchParams.get("redirect_status");

  const unixDateConverter = (unixTimestamp: number, locale: SupportedLocale) => {
    const date = new Date(unixTimestamp * 1000); // 将秒转换为毫秒
    return date
      .toLocaleString(locale, {
        timeZone: "UTC",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
      .replace(",", " "); // 返回 ISO 格式字符串
  };

  const {
    data: paymentDetails,
    error,
    isLoading,
  } = useSWR<PaymentSuccessDetails>(
    paymentIntent && redirectStatus === "succeeded"
      ? `/payment/success-details?payment_intent=${paymentIntent}`
      : null,
  );

  if (!paymentIntent) {
    return (
      <ErrorDisplay
        title={commonT("loadFailed")}
        message={paymentT("missingPaymentIntent")}
        type="error"
        showReload
      />
    );
  }

  if (redirectStatus !== "succeeded") {
    return (
      <ErrorDisplay
        title={commonT("loadFailed")}
        message={paymentT("paymentNotSucceeded")}
        type="error"
        showReload
      />
    );
  }

  if (isLoading) {
    return (
      <LoadingSpinner
        message={paymentT("loadingDetails")}
        size="lg"
        variant="wave"
        fullScreen={true}
      />
    );
  }

  if (error || !paymentDetails) {
    return (
      <ErrorDisplay
        title={commonT("loadFailed")}
        message={error?.message || paymentT("loadDetailsFailed")}
        type="error"
        showReload
      />
    );
  }

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* 成功状态头部 */}
        <motion.div
          className="text-center mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.div
            className="inline-flex items-center justify-center w-16 h-16 bg-success-100 rounded-sm mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              stiffness: 200,
              damping: 15,
              delay: 0.4,
            }}
          >
            <CheckCircle className="w-8 h-8 text-success-500" />
          </motion.div>
          <motion.h1
            className="text-4xl mb-4 text-foreground-50 font-bold"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            {paymentT("title")}
          </motion.h1>
          <motion.p
            className="text-lg max-w-2xl mx-auto leading-relaxed text-foreground-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            {paymentT("description")}
          </motion.p>
        </motion.div>

        {/* 订单信息卡片 */}
        <motion.div
          className="bg-card-100 rounded-sm border border-border-100 p-6 mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground-50 flex items-center">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              {paymentT("orderInfo")}
            </h2>
            <span className="text-xs sm:text-sm text-foreground-200 break-all">
              {paymentT("orderNumber")}: {paymentDetails.order_number}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-2 text-foreground-200 shrink-0" />
                <span className="text-foreground-200">{paymentT("paymentTime")}:</span>
              </div>
              <span className="text-foreground-50 sm:ml-2 wrap-break-word">
                {unixDateConverter(paymentDetails.payment_date, locale as SupportedLocale)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end gap-1 sm:gap-0">
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-foreground-200 shrink-0" />
                <span className="text-foreground-200">{paymentT("paymentMethod")}:</span>
              </div>
              <span className="text-foreground-50 sm:ml-2 capitalize">
                {paymentDetails.payment_type}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 产品详情卡片 */}
        <motion.div
          className="bg-card-100 rounded-sm border border-border-100 p-6 mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <h2 className="text-lg sm:text-xl font-semibold text-foreground-50 mb-4">
            {paymentT("purchasedProduct")}
          </h2>

          <div className="flex flex-col lg:flex-row lg:items-stretch gap-4 sm:gap-6">
            <div className="shrink-0 flex justify-center lg:justify-start">
              <div className="w-40 h-40 sm:w-[180px] sm:h-[180px] lg:w-[200px] lg:h-auto lg:min-h-[200px]">
                <Image
                  src={paymentDetails.project.cover_url}
                  alt={paymentDetails.project.project_name}
                  width={200}
                  height={200}
                  className="rounded-sm object-cover w-full h-full"
                />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className="text-base sm:text-lg font-semibold text-foreground-50 mb-2 wrap-break-word">
                {paymentDetails.project.project_name}
              </h3>
              <p className="text-sm sm:text-base text-foreground-200 mb-3 wrap-break-word">
                {paymentDetails.project.project_description}
              </p>
              {paymentDetails.project.project_section_name && (
                <p className="text-xs sm:text-sm text-foreground-300 mb-3">
                  {paymentT("category")}:{" "}
                  <span className="wrap-break-word">
                    {paymentDetails.project.project_section_name}
                  </span>
                </p>
              )}

              <div className="bg-card-50 rounded-sm p-3 sm:p-4">
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-foreground-100 flex-1">{paymentT("productPrice")}:</span>
                    <span className="text-foreground-100 font-medium ml-2">
                      {formatCurrency(paymentDetails.project.project_price, format, "NZD")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-foreground-100 flex-1">
                      {paymentDetails.tax.tax_name} ({paymentDetails.tax.tax_rate * 100}%):
                    </span>
                    <span className="text-foreground-100 font-medium ml-2">
                      {formatCurrency(paymentDetails.tax.tax_amount, format, "NZD")}
                    </span>
                  </div>
                  <div className="flex justify-between items-center font-semibold text-sm sm:text-base border-t border-border-50 pt-2">
                    <span className="text-foreground-100">{paymentT("total")}:</span>
                    <span className="text-foreground-100 ml-2">
                      {formatCurrency(paymentDetails.final_amount, format, "NZD")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* 用户信息卡片 */}
        <motion.div
          className="bg-card-100 rounded-sm border border-border-100 p-6 mb-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.2 }}
        >
          <h2 className="text-lg sm:text-xl font-semibold text-foreground-50 mb-4 flex items-center">
            <User className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
            {paymentT("buyerInfo")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <span className="text-foreground-200">{paymentT("name")}:</span>
              <span className="text-foreground-50 sm:ml-2 wrap-break-word">
                {paymentDetails.user.user_name}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
              <span className="text-foreground-200">{paymentT("email")}:</span>
              <span className="text-foreground-50 sm:ml-2 wrap-break-word">
                {paymentDetails.user.user_email}
              </span>
            </div>
          </div>
        </motion.div>

        {/* 操作按钮 */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.4 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              onClick={() => router.replace("/")}
              variant="outline"
              className="flex items-center justify-center w-full sm:w-auto px-6 py-3 text-sm sm:text-base border-border-100 hover:bg-background-200 text-foreground-200 hover:text-foreground-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              {paymentT("backToHome")}
            </Button>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Button
              onClick={() => {
                // 检查 project_slug 是否存在
                if (!paymentDetails.project.project_slug) {
                  console.error("Project slug is missing, redirecting to home page");
                  router.replace("/");
                  return;
                }

                // 直接使用 window.history.replaceState 替换当前历史记录
                const targetUrl = `/projects/${paymentDetails.project.project_slug}`;
                window.history.replaceState(null, "", targetUrl);
                // 然后使用 router.replace 确保 Next.js 路由系统正确更新
                router.replace(targetUrl);
              }}
              className="flex items-center justify-center w-full sm:w-auto px-6 py-3 text-sm sm:text-base border-border-100 bg-primary-500 hover:bg-primary-600 text-foreground-50"
            >
              <Download className="w-4 h-4 mr-2" />
              {paymentT("viewProjectDetails")}
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}
