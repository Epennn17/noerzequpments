/* ============================================================
   POST /api/catbox
   Multipart upload — field name: "file"
   Catbox Uploader

   ⚠️ Cloudflare Workers request body limit = 64 MiB (uncompressed).
   Frontend dibatasi max 60 MB untuk aman.
   ============================================================ */

import { buildUrl, jsonResponse, corsPreflight } from "./_lib.js";

export async function onRequestOptions() {
  return corsPreflight();
}

export async function onRequestPost({ request, env }) {
  try {
    const contentType = request.headers.get("content-type") || "";
    if (!contentType.includes("multipart/form-data")) {
      return jsonResponse(
        { error: true, message: "Content-Type harus multipart/form-data" },
        400
      );
    }

    // Cek size dari header Content-Length (opsional, bisa tidak ada)
    const contentLength = parseInt(request.headers.get("content-length") || "0", 10);
    const MAX = 64 * 1024 * 1024; // 64 MiB
    if (contentLength && contentLength > MAX) {
      return jsonResponse(
        { error: true, message: "File terlalu besar (max 64 MB)" },
        413
      );
    }

    // Forward body streaming ke upstream — tanpa load ke memory
    const target = buildUrl(env, "/api/tools/catbox");

    const upstream = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": contentType },
      body: request.body
    });

    const ct = upstream.headers.get("content-type") || "";

    if (!upstream.ok) {
      const text = await upstream.text().catch(() => "");
      return jsonResponse(
        { error: true, status: upstream.status, message: text || `Upstream returned ${upstream.status}` },
        upstream.status
      );
    }

    if (ct.includes("application/json")) {
      const data = await upstream.json();
      return jsonResponse(data, 200);
    }

    const text = await upstream.text();
    return jsonResponse({ raw: text }, 200);
  } catch (err) {
    return jsonResponse({ error: true, status: 502, message: err.message }, 502);
  }
}