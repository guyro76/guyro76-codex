import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

const TARGET = "https://dorihome.co.il/";

async function test(name: string, headers: Record<string,string>) {
  const response = await fetch(TARGET, {
    redirect: "manual",
    cache: "no-store",
    headers,
  });
  const text = await response.text();
  return {
    name,
    status: response.status,
    location: response.headers.get("location"),
    server: response.headers.get("server"),
    contentType: response.headers.get("content-type"),
    contentLength: text.length,
    bodyPrefix: text.slice(0, 180).replace(/\s+/g, " "),
  };
}

export async function GET() {
  const profiles = [
    test("organo", {
      "User-Agent": "OrganoAuditBot/1.0",
      "Accept": "text/html,application/xhtml+xml;q=0.9,*/*;q=0.5",
    }),
    test("browser", {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
      "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
      "Accept-Language": "he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7",
      "Cache-Control": "no-cache",
      "Pragma": "no-cache",
      "Upgrade-Insecure-Requests": "1",
    }),
    test("simple-browser", {
      "User-Agent": "Mozilla/5.0 AppleWebKit/537.36 Chrome/149 Safari/537.36",
      "Accept": "text/html",
      "Accept-Language": "he,en;q=0.8",
    }),
  ];

  const results = await Promise.all(profiles);
  return NextResponse.json({ target: TARGET, results });
}
