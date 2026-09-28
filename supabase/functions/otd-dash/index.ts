// otd-dash — the only way the hosted dashboard reads data.
//
// The page sends the MetaGo Central Auth access token it got at sign-in. This function
// checks it against the auth service's public JWKS (same rules as @metago-health/auth-node:
// RS256, issuer, audience, expiry, typ = access), checks the email domain / role, then
// calls one of the read-only otd_dash_* database functions with the service role.
// The database functions themselves are closed to anon/authenticated (see migrations/).
//
// Deploy:  supabase functions deploy otd-dash --no-verify-jwt
//   (--no-verify-jwt: the token is a MetaGo token, not a Supabase one; we verify it here.)
//
// Secrets (supabase secrets set KEY=value):
//   METAGO_AUDIENCE        required. This dashboard's client id at auth.metago.health (comma-separated for several).
//   ALLOWED_ORIGINS        required. Where the page is hosted, e.g. https://shereenbajaj.github.io
//   METAGO_ISSUER          optional, default https://auth.metago.health
//   ALLOWED_EMAIL_DOMAINS  optional, default metago.health. Comma-separated; "*" allows any signed-in user.
//   ALLOWED_ROLES          optional. Comma-separated token roles; empty = any role.

import { createRemoteJWKSet, jwtVerify } from "npm:jose@5";
import { createClient } from "npm:@supabase/supabase-js@2";

const list = (v: string | undefined) => (v ?? "").split(",").map((s) => s.trim()).filter(Boolean);

const ISSUER = (Deno.env.get("METAGO_ISSUER") ?? "https://auth.metago.health").replace(/\/$/, "");
const AUDIENCE = list(Deno.env.get("METAGO_AUDIENCE"));
const ORIGINS = list(Deno.env.get("ALLOWED_ORIGINS"));
const DOMAINS = list(Deno.env.get("ALLOWED_EMAIL_DOMAINS") ?? "metago.health").map((d) => d.toLowerCase());
const ROLES = list(Deno.env.get("ALLOWED_ROLES"));

const JWKS = createRemoteJWKSet(new URL(`${ISSUER}/.well-known/jwks.json`));
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// The only functions the page may call, and how to check their arguments.
const FNS: Record<string, (a: Record<string, unknown>) => Record<string, unknown> | null> = {
  otd_dash_weekly_summary: () => ({}),
  otd_dash_campaign_stats: () => ({}),
  otd_dash_cohorts: () => ({}),
  otd_dash_campaign_week: (a) => (typeof a.w === "string" && /^\d{4}-\d{2}-\d{2}$/.test(a.w) ? { w: a.w } : null),
};

function cors(origin: string | null): Record<string, string> {
  const h: Record<string, string> = { "Vary": "Origin" };
  if (origin && ORIGINS.includes(origin)) {
    h["Access-Control-Allow-Origin"] = origin;
    h["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    h["Access-Control-Allow-Headers"] = "authorization, content-type";
    h["Access-Control-Max-Age"] = "600";
  }
  return h;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { ...cors(origin), "Content-Type": "application/json" } });

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
  if (req.method !== "POST") return json(405, { code: "method_not_allowed" });
  if (!AUDIENCE.length) return json(500, { code: "misconfigured", message: "METAGO_AUDIENCE is not set." });

  // 1. Who is calling?
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
  if (!token) return json(401, { code: "login_required" });
  let claims: Record<string, unknown>;
  try {
    ({ payload: claims } = await jwtVerify(token, JWKS, { issuer: ISSUER, audience: AUDIENCE, algorithms: ["RS256"] }));
  } catch {
    return json(401, { code: "login_required", message: "Sign-in expired or invalid." });
  }
  if (claims.typ !== "access") return json(401, { code: "login_required", message: "Not an access token." });

  // 2. Are they allowed to see the dashboard?
  const email = String(claims.email ?? "").toLowerCase();
  const domainOk = DOMAINS.includes("*") || DOMAINS.includes(email.split("@")[1] ?? "");
  const roleOk = !ROLES.length || ROLES.includes(String(claims.role ?? ""));
  if (!domainOk || !roleOk) return json(403, { code: "not_allowed", message: `${email || "This account"} doesn't have access to this dashboard.` });

  // 3. Run the requested read-only function.
  let body: { fn?: string; args?: Record<string, unknown> };
  try { body = await req.json(); } catch { return json(400, { code: "bad_request" }); }
  const check = body.fn ? FNS[body.fn] : undefined;
  const args = check?.(body.args ?? {});
  if (!check || !args) return json(400, { code: "bad_request", message: "Unknown function or bad arguments." });

  const { data, error } = await db.rpc(body.fn!, args);
  if (error) return json(502, { code: error.code, message: error.message });
  return json(200, data);
});
