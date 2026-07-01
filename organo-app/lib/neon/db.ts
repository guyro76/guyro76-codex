import { neon } from "@neondatabase/serverless";
import { requireDatabaseUrl } from "@/lib/neon/env";

export function getSql() {
  return neon(requireDatabaseUrl());
}
