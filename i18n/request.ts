import { cookies } from "next/headers";
import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  // Read locale from cookie, fallback to 'en'
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";
  const messages = (await import(`./messages/${locale}.json`)).default;

  return {
    locale,
    messages: messages,
  };
});
