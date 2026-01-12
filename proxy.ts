import { type NextRequest, NextResponse } from "next/server";

const AUTH_PAGES = ["/login", "/register", "/reset-password"];
const PROTECTED_PAGES = ["/dashboard"];

export default async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));
  const isProtectedPage = PROTECTED_PAGES.some((page) => pathname.startsWith(page));

  // 快速检查：是否有认证相关的 cookie（不调用 API，用于 dashboard 内部快速跳转）
  const hasAuthCookies = () => {
    // 检查是否存在 access_token 或 refresh_token cookie
    const accessToken = request.cookies.get("access_token");
    const refreshToken = request.cookies.get("refresh_token");
    return !!(accessToken || refreshToken);
  };

  // 完整认证检查：调用后端 API 验证 token 有效性
  const checkAuth = async () => {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/check-auth-token`;

      // 获取请求中的所有 cookies，构建 Cookie 头
      const cookies = request.cookies.getAll();
      const cookieHeader = cookies.map((cookie) => `${cookie.name}=${cookie.value}`).join("; ");

      // 调用 API 检查认证状态
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          Cookie: cookieHeader || "",
          "Content-Type": "application/json",
          "User-Agent": request.headers.get("user-agent") || "",
          Accept: request.headers.get("accept") || "application/json",
        },
        credentials: "include",
      });

      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;

        // 【主动刷新】如果只有 refresh_token，尝试刷新 access_token
        // 注意：middleware 中无法直接接收后端设置的 cookie
        // 所以我们采用"允许通过"的策略，让客户端 authContext 来处理刷新
        if (data && data.refresh_token === true && data.access_token === false) {
          // 有有效的 refresh_token，允许访问，让客户端处理刷新
          return true;
        }

        return data && data.access_token === true;
      }
      return false;
    } catch (error) {
      console.debug("API server not available");
      return false;
    }
  };

  // 处理认证页面：已登录用户重定向到首页
  if (isAuthPage) {
    // 对于认证页面，需要完整检查（确保已登录用户不能访问登录页）
    const isAuthenticated = await checkAuth();
    if (isAuthenticated) {
      const response = NextResponse.redirect(new URL("/", request.url));
      response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
      return response;
    }
  }

  // 处理受保护页面：未登录用户重定向到登录页
  if (isProtectedPage) {
    // 快速检查：如果有认证 cookie，直接放行（让客户端处理 token 刷新和验证）
    // 这样 dashboard 内部跳转会非常快
    if (hasAuthCookies()) {
      return NextResponse.next();
    }

    // 没有任何认证 cookie，重定向到登录页
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.headers.set("Cache-Control", "no-store, no-cache, must-revalidate");
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/register", "/reset-password", "/dashboard/:path*"],
};
