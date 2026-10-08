/* ============================================================
   POST /api/chatai
   Body: { prompt: "..." }
   Noerz AI Chat
   ============================================================ */

import { buildUrl, proxyJson, jsonResponse, corsPreflight } from "./_lib.js";

export async function onRequestOptions() {
  return corsPreflight();
}

export async function onRequestPost({ request, env }) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: true, message: "Body harus JSON valid" }, 400);
  }

  const prompt = (body?.prompt || "").trim();
  if (!prompt) {
    return jsonResponse({ error: true, message: "Parameter 'prompt' wajib diisi" }, 400);
  }

  try {
    const target = buildUrl(env, "/api/ai/chatai");
    return proxyJson(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt })
    });
  } catch (err) {
    return jsonResponse({ error: true, message: err.message }, 500);
  }
}