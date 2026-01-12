import Link from "next/link";

interface SiteLogoProps {
  size?: "sm" | "md" | "lg" | "xl" | "2xl";
  asChild?: boolean;
}

const SiteLogo = ({ size = "md", asChild = false }: SiteLogoProps) => {
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
      case "2xl":
        return {
          text: "text-3xl",
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
    <Link href="/" className="block group">
      {logoContent}
    </Link>
  );
};

export default SiteLogo;
