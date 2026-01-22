"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import ErrorDisplay from "@/app/components/ui/error/ErrorDisplay";
import BaseModal from "@/app/components/ui/modal/BaseModal";

interface BlogSummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  summaryData: { summary: string } | undefined;
}

interface StreamItem {
  id: string;
  text: string;
  isComplete: boolean;
}

const BlogSummaryModal = ({ isOpen, onClose, summaryData }: BlogSummaryModalProps) => {
  const commonT = useTranslations("common");
  const [streamItems, setStreamItems] = useState<StreamItem[]>([]);
  const timeoutsRef = useRef<NodeJS.Timeout[]>([]);

  useEffect(() => {
    if (!isOpen) {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current = [];
      setStreamItems([]);
      return;
    }

    if (summaryData?.summary) {
      const items = Array.isArray(summaryData.summary)
        ? summaryData.summary
        : [summaryData.summary];

      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current = [];
      setStreamItems([]);

      let globalDelay = 0;

      items.forEach((fullText: string, itemIndex: number) => {
        const itemDelay = itemIndex * 200;
        const itemId = `summary-item-${Date.now()}-${itemIndex}`;

        const timeout = setTimeout(() => {
          setStreamItems((prev) => [...prev, { id: itemId, text: "", isComplete: false }]);

          const chars = fullText.split("");
          chars.forEach((char: string, charIndex: number) => {
            const charTimeout = setTimeout(
              () => {
                setStreamItems((prev) => {
                  const newItems = [...prev];
                  if (newItems[itemIndex]) {
                    newItems[itemIndex] = {
                      id: itemId,
                      text: newItems[itemIndex].text + char,
                      isComplete: charIndex === chars.length - 1,
                    };
                  }
                  return newItems;
                });
              },
              itemDelay + charIndex * 20,
            );

            timeoutsRef.current.push(charTimeout);
          });
        }, globalDelay);

        timeoutsRef.current.push(timeout);
        globalDelay += itemDelay + fullText.length * 20 + 300;
      });
    }

    return () => {
      timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      timeoutsRef.current = [];
    };
  }, [summaryData, isOpen]);

  return (
    <BaseModal isOpen={isOpen} onClose={onClose} title={commonT("summary")} round="sm" size="lg">
      {!summaryData && (
        <ErrorDisplay
          title={commonT("notFound")}
          message={commonT("notFoundMessage")}
          type="error"
        />
      )}

      {summaryData && (
        <div className="space-y-4">
          {streamItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-card-50 border border-border-50 rounded-sm p-4 hover:bg-background-100 transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-8 h-8 rounded-sm bg-primary-50 flex items-center justify-center">
                  <span className="text-sm font-semibold text-primary-500">{index + 1}</span>
                </div>
                <p className="text-foreground-100 flex-1 leading-relaxed">
                  {item.text}
                  {!item.isComplete && (
                    <span className="inline-block w-0.5 h-4 bg-primary-500 ml-1 animate-pulse" />
                  )}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </BaseModal>
  );
};

export default BlogSummaryModal;
