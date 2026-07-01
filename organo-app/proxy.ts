import { NextResponse, type NextRequest } from "next/server";
import { auth, neonAuthConfigured } from "@/lib/neon/auth-server";

const neonMiddleware = auth.middleware({ loginUrl: "/login" });

export default function proxy(request: NextRequest) {
  if (!neonAuthConfigured || !process.env.DATABASE_URL) {
    if (request.nextUrl.pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Authentication is not configured" }, { status: 503 });
    }
    return NextResponse.redirect(new URL("/setup-required", request.url));
  }
  return neonMiddleware(request);
}

export const config = {
  matcher: [
    "/",
    "/home/:path*",
    "/admin/:path*",
    "/monitor/:path*",
    "/report-builder/:path*",
    "/api/admin/:path*",
    "/api/analyze/:path*",
    "/api/generate/:path*",
    "/api/health/:path*",
    "/api/history/:path*",
    "/api/monitor/:path*",
    "/api/status/:path*"
  ]
};
