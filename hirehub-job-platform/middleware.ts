import { NextRequest, NextResponse } from "next/server";
import { getRoleRedirect, SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth/session";

const protectedRoutes = [
  { prefix: "/admin", role: "ADMIN" },
  { prefix: "/recruiter", role: "RECRUITER" },
  { prefix: "/candidate", role: "CANDIDATE" },
] as const;

const guestOnlyRoutes = ["/login", "/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE_NAME)?.value,
  );

  if (guestOnlyRoutes.some((route) => pathname.startsWith(route)) && session) {
    return NextResponse.redirect(new URL(getRoleRedirect(session.role), request.url));
  }

  const matchedRoute = protectedRoutes.find((route) =>
    pathname.startsWith(route.prefix),
  );

  if (!matchedRoute) {
    return NextResponse.next();
  }

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (session.role !== matchedRoute.role) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
