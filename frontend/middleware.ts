import { NextRequest, NextResponse } from "next/server";

const protectedRoutes = [
  "/dashboard",
  "/projects",
  "/workspace",
  "/chat",
  "/insights",
];

export function middleware(req: NextRequest) {
  const token =
    req.cookies.get("sb-access-token")?.value ||
    req.headers.get("authorization");

  const isProtectedRoute = protectedRoutes.some((route) =>
    req.nextUrl.pathname.startsWith(route)
  );

  if (isProtectedRoute && !token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/projects/:path*",
    "/workspace/:path*",
    "/chat/:path*",
    "/insights/:path*",
  ],
};