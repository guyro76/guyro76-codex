import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC = ["/login", "/auth/callback", "/forgot-password", "/reset-password", "/setup-required", "/about", "/faq", "/privacy", "/accessibility", "/security", "/terms", "/robots.txt", "/sitemap.xml", "/llms.txt"];
const isPublic = (path: string) => PUBLIC.some((item) => path === item || path.startsWith(`${item}/`));

export async function proxy(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const api = path.startsWith("/api/");
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  // Fail closed in every environment. Missing auth configuration must never expose
  // the dashboard, API routes, scan history, reports, or admin screens.
  if (!url || !key) {
    if (isPublic(path)) return NextResponse.next();
    if (api) return NextResponse.json({ error: "Authentication is not configured" }, { status: 503 });
    return NextResponse.redirect(new URL("/setup-required", request.url));
  }

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(items) {
        items.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (isPublic(path)) return response;
  if (!user) {
    if (api) return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    const login = new URL("/login", request.url);
    login.searchParams.set("next", path);
    return NextResponse.redirect(login);
  }

  const { data: profile } = await supabase.from("profiles").select("access_status,platform_role").eq("id", user.id).maybeSingle();
  const owner = user.email?.toLowerCase() === "guyro76@gmail.com";
  if (!owner && profile?.access_status !== "active") {
    if (api) return NextResponse.json({ error: "User is not authorized" }, { status: 403 });
    return NextResponse.redirect(new URL("/login?error=not-authorized", request.url));
  }
  if (path.startsWith("/admin") && !owner && profile?.platform_role !== "platform_admin") return NextResponse.redirect(new URL("/", request.url));
  return response;
}

export const config = { matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"] };