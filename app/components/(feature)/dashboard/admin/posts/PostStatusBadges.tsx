"use client";

interface PostStatusBadgesProps {
  isPublished: boolean;
  isArchived: boolean;
  isFeatured: boolean;
  size?: "xs" | "sm";
}

const PostStatusBadges = ({
  isPublished,
  isArchived,
  isFeatured,
  size = "sm",
}: PostStatusBadgesProps) => {
  const textSize = size === "xs" ? "text-[10px]" : "text-xs";
  const padding = size === "xs" ? "px-2 py-0.5" : "px-2 py-1";

  const Badge = ({ label, colorClass }: { label: string; colorClass: string }) => (
    <span className={`${padding} ${textSize} rounded-sm font-medium ${colorClass}`}>{label}</span>
  );

  // Show draft if nothing else is set
  if (!isPublished && !isArchived && !isFeatured) {
    return <Badge label="草稿" colorClass="bg-warning-50 text-warning-500" />;
  }

  return (
    <>
      {isPublished && <Badge label="已发布" colorClass="bg-success-50 text-success-500" />}
      {isArchived && <Badge label="已归档" colorClass="bg-warning-50 text-warning-500" />}
      {isFeatured && <Badge label="精选" colorClass="bg-primary-50 text-primary-500" />}
    </>
  );
};

export default PostStatusBadges;
