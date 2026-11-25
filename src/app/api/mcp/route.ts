import { NextRequest, NextResponse } from "next/server";
import { listToolSchemas, callTool } from "@/lib/mcp-tools";
import { resolveCaller, apiKeyConfigured } from "@/lib/api-auth";

/**
 * Postwave MCP endpoint — streamable HTTP transport.
 *
 * This is the surface ChatGPT (Developer Mode) and Claude.ai (custom connector)
 * talk to directly, and that the local stdio bridge proxies for Claude Code and
 * Codex. The protocol is JSON-RPC 2.0; we answer with `application/json` rather
 * than opening an SSE stream, which the spec permits and which keeps the
 * endpoint stateless and deployable to any serverless host.
 */

export const dynamic = "force-dynamic";

// Versions of the MCP spec this server speaks, newest first.
const SUPPORTED = ["2025-06-18", "2025-03-26", "2024-11-05"];

const SERVER_INFO = {
  name: "postwave",
  title: "Postwave",
  version: "1.0.0",
};

const INSTRUCTIONS = `Postwave is a Hebrew-first social content factory with a built-in GEO engine.

Typical flow:
1. postwave_trends — find something current worth posting about (optional).
2. postwave_create_content — turn a topic into a finished carousel, post, story,
   presentation or reel script, already structured for AI citation.
3. postwave_geo_score / postwave_geo_optimize — check and raise how likely the
   piece is to be quoted by ChatGPT, Claude, Perplexity and AI Overviews.
4. postwave_publish — post it. This is a real public action: confirm the caption
   and the target networks with the user first.

Content is produced in Hebrew by default and reads right-to-left.`;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-postwave-key, mcp-protocol-version",
};

type JsonRpcId = string | number | null;

interface JsonRpcRequest {
  jsonrpc?: string;
  id?: JsonRpcId;
  method?: string;
  params?: Record<string, unknown>;
}

function ok(id: JsonRpcId, result: unknown) {
  return { jsonrpc: "2.0" as const, id, result };
}

function err(id: JsonRpcId, code: number, message: string) {
  return { jsonrpc: "2.0" as const, id, error: { code, message } };
}

/** Tools that change something outside Postwave always require a key. */
const SIDE_EFFECT_TOOLS = new Set(["postwave_publish"]);

async function handleOne(
  msg: JsonRpcRequest,
  authed: boolean
): Promise<object | null> {
  const id = msg.id ?? null;
  const method = msg.method || "";
  const params = msg.params || {};

  switch (method) {
    case "initialize": {
      const asked = String(
        (params as { protocolVersion?: string }).protocolVersion || ""
      );
      const protocolVersion = SUPPORTED.includes(asked) ? asked : SUPPORTED[0];
      return ok(id, {
        protocolVersion,
        capabilities: { tools: { listChanged: false } },
        serverInfo: SERVER_INFO,
        instructions: INSTRUCTIONS,
      });
    }

    // Notifications carry no id and get no response.
    case "notifications/initialized":
    case "notifications/cancelled":
      return null;

    case "ping":
      return ok(id, {});

    case "tools/list":
      return ok(id, { tools: listToolSchemas() });

    case "tools/call": {
      const p = params as { name?: string; arguments?: Record<string, unknown> };
      const name = String(p.name || "");
      if (!name) return err(id, -32602, "Missing tool name");

      if (SIDE_EFFECT_TOOLS.has(name) && !authed) {
        return ok(id, {
          content: [
            {
              type: "text",
              text:
                "Publishing is disabled for unauthenticated callers. Set POSTWAVE_API_KEY " +
                "on the server and send it as 'Authorization: Bearer <key>'.",
            },
          ],
          isError: true,
        });
      }

      const result = await callTool(name, p.arguments || {});
      return ok(id, result);
    }

    // Declared unsupported rather than silently empty, so clients stop asking.
    case "resources/list":
    case "prompts/list":
      return err(id, -32601, `Method not supported: ${method}`);

    default:
      return err(id, -32601, `Method not found: ${method}`);
  }
}

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json(err(null, -32700, "Parse error"), {
      status: 400,
      headers: CORS,
    });
  }

  // When no key is configured the server is open for read/generate tools, so
  // self-hosting works out of the box; side-effecting tools stay locked.
  const caller = await resolveCaller(req);
  const authed = caller.ok || !apiKeyConfigured();

  // If a key IS configured, reject unauthenticated callers outright.
  if (apiKeyConfigured() && !caller.ok) {
    return NextResponse.json(err(null, -32001, "Unauthorized"), {
      status: 401,
      headers: CORS,
    });
  }

  const batch = Array.isArray(payload) ? payload : [payload];
  const responses: object[] = [];
  for (const msg of batch) {
    const r = await handleOne((msg || {}) as JsonRpcRequest, authed);
    if (r) responses.push(r);
  }

  // All-notifications batch: acknowledge with 202 and no body.
  if (responses.length === 0) {
    return new NextResponse(null, { status: 202, headers: CORS });
  }

  return NextResponse.json(Array.isArray(payload) ? responses : responses[0], {
    headers: { ...CORS, "Cache-Control": "no-store" },
  });
}

/** Discovery aid: a plain GET describes the server instead of 405-ing. */
export async function GET() {
  return NextResponse.json(
    {
      ...SERVER_INFO,
      transport: "streamable-http",
      protocolVersions: SUPPORTED,
      tools: listToolSchemas().map((t) => t.name),
      authRequired: apiKeyConfigured(),
      hint: "POST JSON-RPC 2.0 to this URL. Start with the 'initialize' method.",
    },
    { headers: CORS }
  );
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}
