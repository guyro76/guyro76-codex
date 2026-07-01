import { contactEmail, siteUrl } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const body = [
    `Contact: mailto:${contactEmail}`,
    `Policy: ${siteUrl()}/security`,
    `Canonical: ${siteUrl()}/.well-known/security.txt`,
    "Preferred-Languages: he, en",
    "Expires: 2027-07-01T00:00:00.000Z",
  ].join("\n");

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400",
    },
  });
}
