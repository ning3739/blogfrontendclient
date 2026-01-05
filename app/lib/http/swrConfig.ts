import type { SWRConfiguration } from "swr";
import httpClient from "./client";
import fetcher from "./fetcher";

// SWR 全局配置
export const swrConfig: SWRConfiguration = {
  fetcher,
  revalidateOnFocus: false,
  revalidateOnReconnect: true,
  errorRetryCount: 3,
  errorRetryInterval: 1000,
  dedupingInterval: 500, // 减少去重间隔，加快数据更新
  shouldRetryOnError: (error) => error?.status !== 401,
};

// 添加语言变化监听，自动重新验证所有数据
if (typeof window !== "undefined") {
  let revalidatePromise: Promise<Array<undefined>> | null = null;

  httpClient.addLocaleChangeListener(() => {
    // 如果已有重验证在进行，等待它完成
    if (revalidatePromise) return;

    revalidatePromise = import("swr")
      .then(({ mutate }) => mutate(() => true, undefined, { revalidate: true }))
      .finally(() => {
        revalidatePromise = null;
      });
  });
}
