import { spawn } from "node:child_process";
import { setTimeout } from "node:timers/promises";

const port = 18993;
const base = `http://127.0.0.1:${port}`;
let output = "";
const server = spawn("npx", ["wrangler", "dev", "--local", "--ip", "127.0.0.1", "--port", String(port), "--config", "tests/wrangler-pdf.jsonc"], {
  env: { ...process.env, CLOUDFLARE_API_TOKEN: "", WRANGLER_SEND_METRICS: "false" },
  stdio: ["ignore", "pipe", "pipe"],
  detached: true,
});
server.stdout.on("data", (chunk) => { output += chunk; });
server.stderr.on("data", (chunk) => { output += chunk; });
try {
  let ready = false;
  for (let attempt = 0; attempt < 90; attempt++) {
    if (server.exitCode !== null) throw new Error(`Local Worker exited ${server.exitCode}\n${output}`);
    try { ready = (await fetch(`${base}/fonts/NotoSans-Regular.ttf`, { signal: AbortSignal.timeout(2000) })).ok; } catch { /* Await local startup. */ }
    if (ready) break;
    await setTimeout(1000);
  }
  if (!ready) throw new Error(`Local Worker did not start\n${output}`);
  const now = Math.floor(Date.now() / 1000);
  const encode = (value) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: "00000000-0000-4000-8000-000000000001", aud: "authenticated", role: "authenticated", iat: now, exp: now + 3600 })}.local-test-only`;
  const session = { access_token: token, refresh_token: "local-test-only", expires_at: now + 3600, expires_in: 3600, token_type: "bearer", user: { id: "00000000-0000-4000-8000-000000000001" } };
  const ref = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname.split(".")[0];
  const response = await fetch(`${base}/api/loans/pdf-test/agreement`, { headers: { cookie: `sb-${ref}-auth-token=base64-${encode(session)}` }, signal: AbortSignal.timeout(60000) });
  const bytes = Buffer.from(await response.arrayBuffer());
  if (response.status !== 200 || !response.headers.get("content-type")?.includes("application/pdf") || bytes.subarray(0, 5).toString() !== "%PDF-" || bytes.length < 5000) {
    await setTimeout(1000);
    throw new Error(`Local Worker PDF failed: HTTP ${response.status}, ${bytes.subarray(0, 600).toString()}\n${output}`);
  }
  console.log(`Worker PDF route returned HTTP 200 and ${bytes.length} PDF bytes with isolated provider fixtures`);
} finally {
  try { process.kill(-server.pid, "SIGTERM"); } catch (error) { if (error.code !== "ESRCH") throw error; }
}
