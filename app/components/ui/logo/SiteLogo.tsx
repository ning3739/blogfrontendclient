"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface SiteLogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  asChild?: boolean;
}

const SiteLogo = ({ size = "md", asChild = false }: SiteLogoProps) => {
  const pathname = usePathname();
  const [isClicked, setIsClicked] = useState(false);
  const [isDashboard, setIsDashboard] = useState(false);

  const handleHomepageClick = () => {
    setIsClicked(!isClicked);
  };

  useEffect(() => {
    setIsDashboard(pathname.startsWith("/dashboard"));
  }, [pathname]);

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          text: "text-sm",
          padding: "py-1",
        };
      case "md":
        return {
          text: "text-base",
          padding: "py-2",
        };
      case "lg":
        return {
          text: "text-lg",
          padding: "py-3",
        };
      case "xl":
        return {
          text: "text-xl",
          padding: "py-4",
        };
      default:
        return {
          text: "text-base",
          padding: "py-2",
        };
    }
  };

  const sizeClasses = getSizeClasses();

  if (pathname === "/login") {
    return (
      <button
        type="button"
        onClick={handleHomepageClick}
        className="block group cursor-pointer bg-transparent border-0 p-0"
      >
        <motion.div className={sizeClasses.padding} whileTap={{ scale: 0.95 }}>
          <span className={`text-primary-600 ${sizeClasses.text} font-semibold`}>
            {isClicked ? "HELLO" : "HEY"}
          </span>
          <span className={`${sizeClasses.text} font-semibold text-foreground-200`}>
            {isClicked ? "FRIEND" : "XIAOLI"}
          </span>
        </motion.div>

        {/* 展开的内容 */}
        {/* <motion.div
          initial={false}
          animate={{
            height: isClicked ? "auto" : 0,
            opacity: isClicked ? 1 : 0,
          }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className="overflow-hidden"
        >
          <div className=" pb-2">
            <div className="text-sm text-foreground-400">
              {isClicked ? "欢迎来到我们的平台！" : "点击了解更多"}
            </div>
          </div>
        </motion.div> */}
      </button>
    );
  }
  const logoContent = (
    <div className={sizeClasses.padding}>
      <span className={`text-primary-600 ${sizeClasses.text} font-semibold`}>HEY</span>
      <span className={`${sizeClasses.text} font-semibold text-foreground-200`}>XIAOLI</span>
    </div>
  );

  if (asChild) {
    return logoContent;
  }

  return (
    <Link
      href="/"
      className="block group"
      {...(isDashboard && {
        target: "_blank",
        rel: "noopener noreferrer",
      })}
    >
      {logoContent}
    </Link>
  );
};

export default SiteLogo;
