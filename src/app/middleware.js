import { NextResponse } from "next/server";
export function middleware(request) {
  const token = request.cookies.get("token")?.value;
  const { pathname } = request.nextUrl;

  console.log("Middleware running for path:", pathname);
  console.log("Token in middleware:", token);

  if (pathname === "/" || pathname === "/login" || pathname === "/signup") {
    if (token) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/api")) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
      const decodedToken = verifyToken(token);
      if (!decodedToken) {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/api/:path*", "/login", "/signup"],
};
