import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

export default function middleware(req: NextRequest) {
  const token = req.cookies.get("accessToken")?.value;
  const { pathname } = req.nextUrl;

  // Allow next.js static files & API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/favicon.ico") ||
    pathname.startsWith("/images") ||
    pathname.match(/\.(.*)$/)
  ) {
    return NextResponse.next();
  }

  // Public routes
  const PUBLIC_ROUTES = ["/login", "/"];

  if (!token) {
    // Unauthenticated can access only login + home
    if (PUBLIC_ROUTES.includes(pathname)) return NextResponse.next();
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // =====================================
  // VALIDATE JWT
  // =====================================
  let user: any;
  try {
    user = jwt.verify(token, process.env.JWT_SECRET!);
  } catch (e) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const userRole = user.role;

  // =====================================
  // ROLE BASED PROTECTED ROUTES
  // =====================================
  const ROLE_ROUTES: Record<string, string[]> = {
    "/admin": ["ADMIN"],
    "/teacher": ["TEACHER"],
    "/student": ["STUDENT"],
  };

  for (const route in ROLE_ROUTES) {
    if (pathname.startsWith(route)) {
      if (!ROLE_ROUTES[route].includes(userRole)) {
        return NextResponse.redirect(new URL("/login", req.url));
      }
    }
  }

  // =====================================
  // ALREADY LOGGED IN → redirect based on role
  // =====================================
  if (PUBLIC_ROUTES.includes(pathname)) {
    if (userRole === "ADMIN") return NextResponse.redirect(new URL("/admin", req.url));
    if (userRole === "TEACHER") return NextResponse.redirect(new URL("/teacher", req.url));
    if (userRole === "STUDENT") return NextResponse.redirect(new URL("/student", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
