"use client";

import { Elements } from "@stripe/react-stripe-js";
import type { Stripe } from "@stripe/stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import paymentService from "@/app/lib/services/paymentService";
import type { CreatePaymentIntentRequest } from "@/app/types/paymentServiceType";
import CheckoutForm from "./CheckoutForm";

const PaymentElement = ({
  project_id,
  cover_url,
  project_name,
  project_description,
  project_price,
  tax_name,
  tax_rate,
  tax_amount,
  final_amount,
}: CreatePaymentIntentRequest) => {
  const { theme } = useTheme();
  const [stripePromise, setStripePromise] = useState<Stripe | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // First, load Stripe
        const stripePublicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || "";

        if (!stripePublicKey) {
          throw new Error("Stripe public key not configured");
        }

        const stripe = await loadStripe(stripePublicKey);

        if (!stripe) {
          throw new Error("Failed to load Stripe");
        }

        setStripePromise(stripe);

        // Then, create PaymentIntent
        const response = await paymentService.createPaymentIntent({
          project_id: project_id,
          cover_url: cover_url,
          project_name: project_name,
          project_description: project_description,
          project_price: project_price,
          tax_name: tax_name,
          tax_rate: tax_rate,
          tax_amount: tax_amount,
          final_amount: final_amount,
        });

        if ("error" in response) {
          throw new Error(response.error);
        }

        const clientSecret = response.data?.client_secret;
        if (!clientSecret || typeof clientSecret !== "string") {
          throw new Error("Invalid client secret received from server");
        }

        setClientSecret(clientSecret);
      } catch (err) {
        console.error("Error initializing payment:", err);
        if (err instanceof Error && err.message.includes("Stripe")) {
          setError("Stripe 加载失败，请检查网络连接");
        } else {
          setError("创建支付失败，请重试");
        }
      } finally {
        setIsLoading(false);
      }
    };

    initializePayment();
  }, [
    project_id,
    cover_url,
    project_name,
    project_description,
    project_price,
    tax_name,
    tax_rate,
    tax_amount,
    final_amount,
  ]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-2"></div>
          <p className="text-foreground-300">正在加载支付组件...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-error-50 border border-error-100 rounded-sm">
        <p className="text-error-500 text-sm">{error}</p>
        <p className="text-error-400 text-xs mt-1">请检查网络连接或刷新页面重试</p>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="p-4 bg-warning-50 border border-warning-100 rounded-sm">
        <p className="text-warning-500 text-sm">Stripe 初始化失败</p>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="p-4 bg-info-50 border border-info-100 rounded-sm">
        <p className="text-info-500 text-sm">正在生成支付信息...</p>
      </div>
    );
  }

  const options = {
    clientSecret,
    appearance: {
      theme: (theme === "dark" ? "night" : "stripe") as "night" | "stripe",
    },
  };

  return (
    <Elements stripe={stripePromise} options={options}>
      <CheckoutForm />
    </Elements>
  );
};

export default PaymentElement;
