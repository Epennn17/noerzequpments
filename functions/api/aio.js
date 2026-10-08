/* ============================================================
   GET /api/aio?url=...
   All-in-One Downloader
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
    const target = buildUrl(env, "/api/downloader/aio", { url });
    return proxyJson(target);
  } catch (err) {
    return jsonResponse({ error: true, message: err.message }, 500);
  }
}