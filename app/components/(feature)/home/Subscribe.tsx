"use client";

import { Check } from "lucide-react";
import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import type React from "react";
import { useState } from "react";
import toast from "react-hot-toast";
import { Button } from "@/app/components/ui/button/butten";
import subscriberService from "@/app/lib/services/subscriber";
import { Validator } from "@/app/lib/utils/validator";
import InputField from "../../ui/input/InputField";

const Subscribe = () => {
  const [email, setEmail] = useState("");
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const homeT = useTranslations("home");
  const handleEmailSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !Validator.validateEmail(email)) {
      toast.error(homeT("subscribeValidationErrorMessage"));
      return;
    }

    setIsSubscribing(true);

    try {
      const response = await subscriberService.createSubscriber({ email });
      if (response.status === 200) {
        toast.success("message" in response ? response.message : "Subscribed successfully");
        setIsSubscribed(true);
        setEmail("");
      } else {
        toast.error("error" in response ? response.error : "Failed to subscribe");
      }
    } catch (error) {
      console.error(homeT("subscribeError"), error);
      toast.error("Failed to subscribe");
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 订阅卡片 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="sm:w-full md:w-2/3 mx-auto h-full flex flex-col bg-background-100 border border-border-100 rounded-sm p-6 shadow-sm"
      >
        {/* 邮箱订阅 */}
        <div className="flex-1 flex flex-col">
          <p className="text-sm text-foreground-300 mb-3">{homeT("subscribeDescription")}</p>
          <form onSubmit={handleEmailSubscribe} className="space-y-3 flex-1 flex flex-col">
            <InputField
              type="email"
              id="email-subscribe"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={homeT("subscribeInputPlaceholder")}
              disabled={isSubscribed}
              className="w-full rounded-sm border border-border-100 bg-background-50 px-4 py-2.5 text-sm text-foreground-50 placeholder:text-foreground-400 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            />
            <div className="flex-1 flex flex-col justify-end">
              <Button
                type="submit"
                variant="primary"
                size="md"
                fullWidth
                disabled={isSubscribing || isSubscribed}
                loading={isSubscribing}
                loadingText={homeT("subscribeLoading")}
              >
                {isSubscribed ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    <span>{homeT("alreadySubscribed")}</span>
                  </>
                ) : (
                  <span>{homeT("subscribeTitle")}</span>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* 提示信息 */}
        {isSubscribed && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-xs text-center text-foreground-400"
          >
            {homeT("subscribeNotification")}
          </motion.p>
        )}
      </motion.div>

      {/* 分隔线 */}
      <motion.div
        className="w-full h-px bg-border-100 mx-auto my-16"
        initial={{ opacity: 0, scaleX: 0 }}
        animate={{ opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.5, delay: 1.1 }}
      />
    </div>
  );
};

export default Subscribe;
