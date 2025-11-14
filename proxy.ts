import { type NextRequest, NextResponse } from "next/server";

const AUTH_PAGES = ["/login", "/register", "/reset-password"];

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

  if (isAuthPage) {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/check-auth-token`;

      // 获取请求中的所有 cookies，构建 Cookie 头
      // 由于后端设置了 domain=.heyxiaoli.com，cookie 可以在 heyxiaoli.com 和 api.heyxiaoli.com 之间共享
      // Next.js middleware 可以读取这些共享的 cookies
      const cookies = request.cookies.getAll();
      const cookieHeader = cookies
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");

      // 调用 API 检查认证状态
      // 转发 cookies 到后端 API，后端会验证这些 cookies 的有效性
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Cookie: cookieHeader || "", // 转发所有可用的 cookies
          "Content-Type": "application/json",
          // 转发原始请求的其他相关头信息
          "User-Agent": request.headers.get("user-agent") || "",
          Accept: request.headers.get("accept") || "application/json",
        },
        credentials: "include", // 确保包含 cookies（虽然手动设置 Cookie 头已经足够）
      });

      if (response.ok) {
        const result = await response.json();
        // 后端返回格式: { status: 200, message: "...", data: { access_token: true/false, refresh_token: true/false } }
        const data = result.data || result;
        // 只检查 access_token：如果 access_token 有效，说明用户已登录且 token 未过期，应该重定向
        // 如果 access_token 过期，应该通过自动刷新机制获取新的，而不是停留在登录页
        if (data && data.access_token === true) {
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
