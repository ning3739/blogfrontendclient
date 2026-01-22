"use client";

import Image from "next/image";

interface UserAvatarProps {
  user: {
    avatar_url?: string;
    username?: string;
  } | null;
  size?: "xs" | "sm" | "md" | "lg";
  className?: string;
}

const sizeConfig = {
  xs: { container: "w-6 h-6", text: "text-xs", imageSize: 24 },
  sm: { container: "w-8 h-8", text: "text-base", imageSize: 32 },
  md: { container: "w-10 h-10", text: "text-lg", imageSize: 40 },
  lg: { container: "w-12 h-12", text: "text-xl", imageSize: 48 },
};

const UserAvatar = ({ user, size = "sm", className = "" }: UserAvatarProps) => {
  const config = sizeConfig[size];

  if (user?.avatar_url?.trim()) {
    return (
      <Image
        src={user.avatar_url}
        alt="avatar"
        width={config.imageSize}
        height={config.imageSize}
        className={`${config.container} rounded-full object-cover border border-border-100 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${config.container} bg-primary-100 rounded-full flex items-center justify-center border border-border-100 ${className}`}
    >
      <span className={`text-primary-600 ${config.text} font-semibold`}>
        {user?.username?.charAt(0)?.toUpperCase() || "U"}
      </span>
    </div>
  );
};

export default UserAvatar;
