/* ============================================================
   GET /api/tempmail?action=create
   GET /api/tempmail?action=inbox&email=...
   TempMail Create + Inbox
   ============================================================ */

import { buildUrl, proxyJson, jsonResponse, corsPreflight } from "./_lib.js";

export async function onRequestOptions() {
  return corsPreflight();
}

export async function onRequestGet({ request, env }) {
  const params = new URL(request.url).searchParams;
  const action = params.get("action");
  const email = params.get("email");

  try {
    if (action === "create") {
      const target = buildUrl(env, "/api/tools/tempmail", { action: "create" });
      return proxyJson(target);
    }

    if (action === "inbox") {
      if (!email) {
        return jsonResponse({ error: true, message: "Parameter 'email' wajib diisi" }, 400);
      }
      const target = buildUrl(env, "/api/tools/tempmail", { action: "inbox", email });
      return proxyJson(target);
    }

    return jsonResponse(
      { error: true, message: "Parameter 'action' harus 'create' atau 'inbox'" },
      400
    );
  } catch (err) {
    return jsonResponse({ error: true, message: err.message }, 500);
  }
}