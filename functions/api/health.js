/* ============================================================
   GET /api/health
   Health check
   ============================================================ */

import { jsonResponse, corsPreflight } from "./_lib.js";

export async function onRequestOptions() {
  return corsPreflight();
}

export async function onRequestGet({ env }) {
  return jsonResponse({
    ok: true,
    time: new Date().toISOString(),
    apiBase: env.JERE_API_BASE || "https://api.jerexd.my.id",
    hasKey: !!env.JERE_API_KEY
  });
}