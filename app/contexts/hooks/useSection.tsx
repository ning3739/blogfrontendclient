import { useLocale } from "next-intl";
import useSWRImmutable from "swr/immutable";

export default function useSection() {
  const locale = useLocale();

  // sections 数据变化频率极低，使用 useSWRImmutable 禁用自动重验证
  const {
    data: sections,
    error,
    isLoading,
  } = useSWRImmutable(["/section/get-section-lists", locale]);

  return { sections, error, isLoading };
}

export function useSectionDetailsBySlug(slug: string | null) {
  const locale = useLocale();

  // section 详情同样变化不频繁，使用 useSWRImmutable
  const {
    data: section,
    error,
    isLoading,
  } = useSWRImmutable(slug ? [`/section/get-section-details-by-slug/${slug}`, locale] : null);

  return { section, error, isLoading };
}
