/* ============================================================
   GET /api/tiktok?url=...
   Free TikTok Likes
   ============================================================ */

import { buildUrl, proxyJson, jsonResponse, corsPreflight } from "./_lib.js";

export async function onRequestOptions() {
  return corsPreflight();
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url).searchParams.get("url");
  if (!url) {
    return jsonResponse({ error: true, message: "Parameter 'url' wajib diisi" }, 400);
  }

  try {
    const target = buildUrl(env, "/api/tools/freetiktoklike", { url });
    return proxyJson(target);
  } catch (err) {
    return jsonResponse({ error: true, message: err.message }, 500);
  }
}