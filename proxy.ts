// import { type NextRequest, NextResponse } from "next/server";

// const AUTH_PAGES = ["/login", "/register", "/reset-password"];
// const PROTECTED_ROUTES = ["/dashboard"];

// // 检查路径是否是保护路由（包括子路由）
// function isProtectedRoute(pathname: string): boolean {
//   return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
// }

// // 检查认证状态
// async function checkAuthStatus(cookieHeader: string | null) {
//   try {
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/check-auth-token`,
//       {
//         method: "GET",
//         headers,
//       }
//     );

//     if (response.ok) {
//       const data = await response.json();
//       const { access_token, refresh_token } = data.data;
//       return {
//         hasToken: access_token === true || refresh_token === true,
//         access_token,
//         refresh_token,
//       };
//     }
//     return { hasToken: false, access_token: false, refresh_token: false };
//   } catch (error) {
//     console.log("Auth check failed:", error);
//     return { hasToken: false, access_token: false, refresh_token: false };
//   }
// }

// export default async function proxy(request: NextRequest) {
//   const { pathname } = request.nextUrl;
//   const isAuthPage = AUTH_PAGES.includes(pathname);
//   const isProtected = isProtectedRoute(pathname);
//   const cookieHeader = request.headers.get("cookie");

//   // 处理认证页面：如果已登录，重定向到首页
//   if (isAuthPage) {
//     const authStatus = await checkAuthStatus(cookieHeader);
//     if (authStatus.hasToken) {
//       return NextResponse.redirect(new URL("/", request.url));
//     }
//     // 如果未登录，允许访问认证页面
//     return NextResponse.next();
//   }

//   // 处理保护路由：如果未登录，重定向到登录页
//   if (isProtected) {
//     const authStatus = await checkAuthStatus(cookieHeader);
//     if (!authStatus.hasToken) {
//       // 没有 access_token 和 refresh_token，重定向到登录页
//       const loginUrl = new URL("/login", request.url);
//       // 保存原始URL以便登录后重定向回来
//       loginUrl.searchParams.set("redirect", pathname);
//       return NextResponse.redirect(loginUrl);
//     }
//     // 如果已登录，允许访问
//     return NextResponse.next();
//   }

//   // 其他页面，允许访问
//   return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/login",
//     "/register",
//     "/reset-password",
//     "/dashboard/:path*", // 匹配 /dashboard 及其所有子路由
//   ],
// };

import { type NextRequest, NextResponse } from "next/server";

const AUTH_PAGES = ["/login", "/register", "/reset-password"];

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const isAuthPage = AUTH_PAGES.some((page) => pathname.startsWith(page));

  if (isAuthPage) {
    try {
      const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/check-login-status`;

      const headers = new Headers(request.headers);

      const response = await fetch(apiUrl, {
        method: "GET",
        headers,
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
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
  matcher: ["/login", "/register", "/forgot-password"],
};
