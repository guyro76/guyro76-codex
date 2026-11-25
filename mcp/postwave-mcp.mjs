#!/usr/bin/env node
/**
 * Postwave MCP server — stdio transport.
 *
 * A zero-dependency bridge: it speaks MCP over stdin/stdout for local clients
 * (Claude Code, Codex, Claude Desktop) and forwards every call to a Postwave
 * deployment's /api/mcp endpoint. The tool catalog lives server-side, so this
 * file never goes stale when tools change.
 *
 * Run it with plain node — nothing to install:
 *
 *   POSTWAVE_URL=https://your-postwave.vercel.app node mcp/postwave-mcp.mjs
 *
 * Environment:
 *   POSTWAVE_URL  Base URL of the Postwave deployment. Default http://localhost:3000
 *   POSTWAVE_API_KEY  Sent as a bearer token; required for publishing.
 */

import { createInterface } from "node:readline";

const BASE = (process.env.POSTWAVE_URL || "http://localhost:3000").replace(/\/+$/, "");
const ENDPOINT = `${BASE}/api/mcp`;
const API_KEY = (process.env.POSTWAVE_API_KEY || "").trim();

/** Log to stderr only — stdout is the protocol channel and must stay clean. */
function log(...args) {
  process.stderr.write(`[postwave-mcp] ${args.join(" ")}\n`);
}

function send(message) {
  process.stdout.write(JSON.stringify(message) + "\n");
}

async function forward(message) {
  const headers = { "Content-Type": "application/json" };
  if (API_KEY) headers.Authorization = `Bearer ${API_KEY}`;

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers,
    body: JSON.stringify(message),
  });

  // 202 = the server accepted a notification and returns no body.
  if (res.status === 202) return null;

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} — ${text.slice(0, 300)}`);
  }
  if (!text.trim()) return null;
  return JSON.parse(text);
}

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });

// Requests are chained so replies leave in the order they arrived, and so a
// closed stdin does not kill calls that are still in flight.
let queue = Promise.resolve();
let closed = false;

async function handle(raw) {
  let message;
  try {
    message = JSON.parse(raw);
  } catch {
    send({ jsonrpc: "2.0", id: null, error: { code: -32700, message: "Parse error" } });
    return;
  }

  const id = message.id ?? null;
  const isNotification = message.id === undefined;

  try {
    const response = await forward(message);
    if (response) send(response);
  } catch (error) {
    // A notification gets no error response — there is no id to answer.
    if (isNotification) {
      log("notification failed:", error.message);
      return;
    }
    send({
      jsonrpc: "2.0",
      id,
      error: {
        code: -32603,
        message: `Cannot reach Postwave at ${ENDPOINT}: ${error.message}`,
      },
    });
  }
}

rl.on("line", (line) => {
  const raw = line.trim();
  if (!raw) return;
  queue = queue.then(() => handle(raw));
  if (closed) queue.then(() => process.exit(0));
});

// Drain whatever is still queued before exiting.
rl.on("close", () => {
  closed = true;
  queue.then(() => process.exit(0));
});

log(`bridging to ${ENDPOINT}${API_KEY ? " (authenticated)" : ""}`);
