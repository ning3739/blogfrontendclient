"use client";

import { PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { AlertTriangle, CreditCard, Lock, XCircle } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/app/components/ui/button/Button";

export default function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // 触发表单验证和钱包收集
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || "表单验证失败");
        return;
      }

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment/success`,
        },
      });

      if (error) {
        setError(error.message || "支付失败");
      }
    } catch (err) {
      console.error("Payment error:", err);
      setError("支付过程中发生错误");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 支付表单区域 */}
        {elements ? (
          <div className="bg-background-50 border border-border-100 rounded-sm shadow-sm overflow-hidden">
            <div className="p-6">
              <PaymentElement
                onLoadError={(error) => {
                  console.error("PaymentElement load error:", error);
                  setError(`支付组件加载失败: ${error.error?.message || "未知错误"}`);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="bg-warning-50 border border-warning-100 rounded-sm p-6">
            <div className="flex items-start">
              <div className="shrink-0">
                <AlertTriangle className="h-5 w-5 text-warning-400" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-warning-500">
                  {stripe ? "正在初始化支付表单..." : "正在加载Stripe..."}
                </h3>
                <div className="mt-2 text-sm text-warning-500">
                  <ul className="list-disc list-inside space-y-1">
                    <li>请检查是否禁用了广告拦截器</li>
                    <li>确保网络连接正常</li>
                    <li>尝试刷新页面重试</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 支付按钮 */}
        <div className="space-y-4">
          <Button
            type="submit"
            variant="primary"
            size="xl"
            gradient
            fullWidth
            loading={isProcessing}
            loadingText="处理中..."
            disabled={!stripe || !elements || isProcessing}
            className="transform hover:scale-[1.02] disabled:hover:scale-100"
          >
            <CreditCard className="w-5 h-5 mr-2" />
            立即支付
          </Button>

          {/* 显示错误消息给客户 */}
          {error && (
            <div className="bg-error-50 border border-error-100 rounded-sm p-4">
              <div className="flex">
                <div className="shrink-0">
                  <XCircle className="h-5 w-5 text-error-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-error-500">支付失败</h3>
                  <div className="mt-2 text-sm text-error-500">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>

      {/* 安全提示 */}
      <div className="mt-8 text-center">
        <div className="flex items-center justify-center text-foreground-300 text-sm">
          <Lock className="w-4 h-4 mr-2" />
          支付由 Stripe 安全处理，您的信息将被加密保护
        </div>
      </div>
    </div>
  );
}
