import { Clock, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useFormatter, useTranslations } from "next-intl";
import { handleDateFormat } from "@/app/lib/utils/handleDateFormat";
import type { BlogCommentItem } from "@/app/types/blogServiceType";
import type { BoardCommentItem } from "@/app/types/boardServiceType";

type CommentItem = BoardCommentItem | BlogCommentItem;

interface CommentHeaderProps {
  comment: CommentItem;
  size?: "sm" | "md";
  isAuthenticated: boolean;
}

const SIZE_CONFIG = {
  sm: { avatar: 28, icon: "w-3 h-3", text: "text-sm" },
  md: { avatar: 36, icon: "w-4 h-4", text: "text-base" },
} as const;

const CommentHeader = ({ comment, size = "md", isAuthenticated }: CommentHeaderProps) => {
  const commonT = useTranslations("common");
  const format = useFormatter();
  const { avatar, icon: iconSize, text: textSize } = SIZE_CONFIG[size];

  const avatarClass = `rounded-full object-cover ${
    comment.user_role === "admin" ? "border border-blue-500" : "border border-gray-200"
  }`;

  const formattedDate = comment.updated_at
    ? `${commonT("updatedAt")} ${handleDateFormat(comment.updated_at, format, "second")}`
    : handleDateFormat(comment.created_at, format, "second");

  const Avatar = () => (
    <Image
      src={comment.avatar_url || "/images/default-avatar.png"}
      alt={comment.username || "User"}
      width={avatar}
      height={avatar}
      className={`w-7 h-7 sm:w-9 sm:h-9 ${avatarClass}`}
    />
  );

  return (
    <div className="flex items-start space-x-2 sm:space-x-3 mb-2 sm:mb-3">
      <div className="shrink-0">
        {isAuthenticated ? (
          <Link href={`/user?userId=${comment.user_id}`} className="group">
            <Avatar />
          </Link>
        ) : (
          <Avatar />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs sm:text-sm text-foreground-400 mb-1">
          {/* Mobile: username and city on same line */}
          <div className="flex items-center justify-between sm:hidden">
            <h4
              className={`font-medium text-foreground-50 truncate flex-1 min-w-0 mr-2 ${textSize}`}
            >
              {comment.username || "Anonymous"}
            </h4>
            <span className="flex items-center shrink-0">
              <MapPin className={`${iconSize} mr-1`} />
              <span className="whitespace-nowrap text-xs">{comment.city || "Unknown"}</span>
            </span>
          </div>

          {/* Desktop: username on separate line */}
          <h4 className={`font-medium text-foreground-50 truncate ${textSize} hidden sm:block`}>
            {comment.username || "Anonymous"}
          </h4>

          {/* Mobile: time below username */}
          <div className="flex items-center mt-1 sm:hidden">
            <Clock className={`${iconSize} mr-1`} />
            <span className="text-xs">{formattedDate}</span>
          </div>

          {/* Desktop: city and time on same line */}
          <div className="hidden sm:flex items-center space-x-3">
            <span className="flex items-center">
              <MapPin className={`${iconSize} mr-1`} />
              <span>{comment.city || ""}</span>
            </span>
            <span className="flex items-center">
              <Clock className={`${iconSize} mr-1`} />
              <span className="text-xs">{formattedDate}</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentHeader;
