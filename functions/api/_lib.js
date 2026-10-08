/* ============================================================
   functions/api/_lib.js
   Helper bersama untuk semua endpoint Cloudflare Pages Functions
   ============================================================ */

/**
 * Bangun URL upstream dengan apikey diinjeksi otomatis dari env.
 * @param {Object} env      — Cloudflare env (JERE_API_KEY, JERE_API_BASE)
 * @param {string} endpoint — contoh: "/api/downloader/aio"
 * @param {Object} params   — parameter query tambahan
 */
export function buildUrl(env, endpoint, params = {}) {
  const apiKey = env.JERE_API_KEY;
  if (!apiKey) {
    throw new Error("JERE_API_KEY belum di-set di Cloudflare environment variables");
  }
  const base = (env.JERE_API_BASE || "https://api.jerexd.my.id").replace(/\/+$/, "");
  const u = new URL(base + endpoint);
  u.searchParams.set("apikey", apiKey);
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== "") {
      u.searchParams.set(k, v);
    }
  }
  return u.toString();
}

/**
 * Response JSON standar dengan CORS.
 */
export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept"
    }
  });
}

/**
 * Proxy request ke upstream dan kembalikan response JSON.
 */
export async function proxyJson(url, options = {}) {
  try {
    const r = await fetch(url, {
      ...options,
      headers: {
        Accept: "application/json",
        ...(options.headers || {})
      }
    });

    const ct = r.headers.get("content-type") || "";

    if (!r.ok) {
      const text = await r.text().catch(() => "");
      return jsonResponse(
        { error: true, status: r.status, message: text || `Upstream returned ${r.status}` },
        r.status
      );
    }

    if (ct.includes("application/json")) {
      const data = await r.json();
      return jsonResponse(data, 200);
    }

    const text = await r.text();
    return jsonResponse({ raw: text }, 200);
  } catch (err) {
    return jsonResponse(
      { error: true, status: 502, message: "Upstream request failed" },
      502
    );
  }
}

/**
 * Handle CORS preflight.
 */
export function corsPreflight() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Accept",
      "Access-Control-Max-Age": "86400"
    }
  });
}