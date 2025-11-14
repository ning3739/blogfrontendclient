import useSWR from "swr";
import { useLocale } from "next-intl";

export default function useSection() {
  const locale = useLocale();

  const {
    data: sections,
    error,
    isLoading,
  } = useSWR(["/section/get-section-lists", locale]);

  return { sections, error, isLoading };
}

export function useSectionDetailsBySlug(slug: string) {
  const locale = useLocale();

  const {
    data: section,
    error,
    isLoading,
  } = useSWR([`/section/get-section-details-by-slug/${slug}`, locale]);

  return { section, error, isLoading };
}
