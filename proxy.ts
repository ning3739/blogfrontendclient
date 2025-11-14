import { type NextRequest, NextResponse } from "next/server";

const AUTH_PAGES = ["/login", "/register", "/reset-password"];

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

  if (isAuthPage) {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/check-auth-token`;

      // 获取请求中的所有 cookies，构建 Cookie 头
      // 注意：由于 cookies 的 domain 是 api.heyxiaoli.com，在 heyxiaoli.com 的请求中
      // 浏览器不会发送这些 cookies，所以我们需要通过 API 调用来检查
      const cookies = request.cookies.getAll();
      const cookieHeader = cookies
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");

      // 调用 API 检查认证状态
      // API 服务器会检查它自己的 cookies（domain: api.heyxiaoli.com）
      // 我们需要确保 API 能够正确读取这些 cookies
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Cookie: cookieHeader || "", // 转发所有可用的 cookies
          "Content-Type": "application/json",
          // 转发原始请求的其他相关头信息
          "User-Agent": request.headers.get("user-agent") || "",
          Accept: request.headers.get("accept") || "application/json",
        },
        // 注意：在服务器端 fetch 中，credentials 选项可能不会自动包含跨域 cookies
        // 但我们可以通过手动设置 Cookie 头来传递
      });

      if (response.ok) {
        const data = await response.json();
        // 检查是否有有效的 access_token 和 refresh_token
        if (data.access_token === true && data.refresh_token === true) {
          return NextResponse.redirect(new URL("/", request.url));
        }
      }
    } catch (error) {
      // 静默处理连接错误，不打印到控制台
      // 当API服务器不可用时，允许用户访问登录页面
      console.debug("API server not available, allowing access to auth pages");
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/reset-password"],
};
