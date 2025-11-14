import { SWRConfiguration } from "swr";
import fetcher from "./fetcher";
import httpClient from "./client";

// SWR 全局配置
export const swrConfig: SWRConfiguration = {
  fetcher,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  errorRetryCount: 3,
  errorRetryInterval: 1000,
};

// 添加语言变化监听，自动重新验证所有数据
if (typeof window !== "undefined") {
  let isRevalidating = false; // 防止重复验证
  httpClient.addLocaleChangeListener(() => {
    if (isRevalidating) return;
    isRevalidating = true;

    // 当语言变化时，重新验证所有 SWR 缓存
    import("swr").then(({ mutate }) => {
      // 重新验证所有缓存
      mutate(() => true, undefined, { revalidate: true }).finally(() => {
        isRevalidating = false;
        console.log("[swrConfig] Revalidation complete");
      });
    });
  });
}
