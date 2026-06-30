import { NextRequest, NextResponse } from "next/server";
import { analyzeWebsite } from "@/lib/analyzer";
import { normalizeUrl, assertPublicUrl } from "@/lib/security";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const test = request.nextUrl.searchParams.get("test") || "example";
  try {
    if (test === "example") {
      const result = await analyzeWebsite("https://example.com");
      return NextResponse.json({
        pass: true,
        case: test,
        status: result.response.status,
        finalUrl: result.finalUrl,
        scores: result.scores,
        checks: result.checks.length,
        title: result.snapshot.title,
      });
    }
    if (test === "private") {
      const url = normalizeUrl("http://127.0.0.1");
      await assertPublicUrl(url);
      return NextResponse.json({ pass: false, case: test, error: "Private IP was not blocked" }, { status: 500 });
    }
    if (test === "protocol") {
      normalizeUrl("file:///etc/passwd");
      return NextResponse.json({ pass: false, case: test, error: "Unsafe protocol was not blocked" }, { status: 500 });
    }
    return NextResponse.json({ pass: false, error: "Unknown QA case" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    if (test === "private" || test === "protocol") {
      return NextResponse.json({ pass: true, case: test, message });
    }
    return NextResponse.json({ pass: false, case: test, message }, { status: 500 });
  }
}
