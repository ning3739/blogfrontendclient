import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import SiteLogo from "@/app/components/ui/logo/SiteLogo";

type AuthPageType = "login" | "register" | "reset-password";

interface AuthBackgroundProps {
  children: React.ReactNode;
  imageType?: AuthPageType;
}

const AuthBackground = ({ children, imageType }: AuthBackgroundProps) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  // 确保组件已挂载，避免水合错误
  useEffect(() => {
    setMounted(true);
  }, []);

  // 自动检测页面类型（如果没有手动指定）
  const detectPageType = (): AuthPageType => {
    if (!mounted) return "login"; // 服务端渲染时使用默认值
    if (pathname.includes("/login")) return "login";
    if (pathname.includes("/register")) return "register";
    if (pathname.includes("/reset-password")) return "reset-password";
    return "login";
  };

  const currentImageType = imageType || detectPageType();

  // 根据页面类型决定显示的图片
  const getImageSrc = (type: AuthPageType): string => {
    switch (type) {
      case "login":
        return "https://images.unsplash.com/photo-1610446244955-c6f6cea76a76?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
      case "register":
        return "https://images.unsplash.com/flagged/photo-1563692040599-7e7d379d37b5?q=80&w=775&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
      case "reset-password":
        return "https://images.unsplash.com/photo-1596709031408-b0b2c9659c8a?q=80&w=689&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
    }
  };

  // 根据页面类型决定alt文本
  const getAltText = (type: AuthPageType): string => {
    switch (type) {
      case "login":
        return "login-background";
      case "register":
        return "register-background";
      case "reset-password":
        return "reset-password-background";
    }
  };

  return (
    <div className="bg-background-100  min-h-screen flex flex-row">
      {/* 左侧：auth表单 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-12 relative min-h-screen">
        {/* SiteLogo - 水平居中显示 */}
        <div className="absolute top-8 left-1/2 lg:left-1/6 transform -translate-x-1/2 lg:-translate-x-1/6 z-20">
          <SiteLogo />
        </div>
        {/* 十字方格背景 - 原有网格带流动效果 */}
        <div className="absolute inset-0 opacity-3">
          <motion.div
            className="w-full h-full bg-gradient-to-r from-transparent via-transparent to-transparent bg-[length:32px_32px] bg-[image:repeating-linear-gradient(0deg,currentColor_0px,currentColor_1px,transparent_1px,transparent_32px),repeating-linear-gradient(90deg,currentColor_0px,currentColor_1px,transparent_1px,transparent_32px)]"
            animate={{
              backgroundPosition: ["0px 0px", "32px 32px"],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        </div>
        {/* 添加渐变遮罩增强质感 */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/3 via-transparent to-primary-50/10 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md">{children}</div>
      </div>
      {/* 右侧：背景图片 - 在小屏幕上隐藏 */}
      <div className="hidden lg:block lg:w-1/2 relative group cursor-pointer">
        <Image
          src={getImageSrc(currentImageType)}
          alt={getAltText(currentImageType)}
          fill
          sizes="50vw"
          priority
          className="object-cover transition-all duration-500 ease-in-out group-hover:grayscale"
        />
      </div>
    </div>
  );
};

export default AuthBackground;
