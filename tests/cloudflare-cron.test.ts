import { describe, expect, it, vi } from "vitest";
import { scheduledPenalties } from "@/worker/cloudflare-cron.mjs";

describe("Cloudflare penalty schedule", () => {
  it("forwards the configured secret to the existing protected route", async () => {
    const fetchHandler = vi.fn(async (request: Request) => {
      expect(request.method).toBe("GET");
      return new Response("ok");
    });
    const env = { CRON_SECRET: "test-only" };
    const ctx = {};
    await scheduledPenalties(fetchHandler, env, ctx);
    const request = fetchHandler.mock.calls[0][0] as Request;
    expect(new URL(request.url).pathname).toBe("/api/cron/penalties");
    expect(request.headers.get("authorization")).toBe("Bearer test-only");
  });

  it("rejects a missing secret without invoking the app", async () => {
    const fetchHandler = vi.fn();
    await expect(scheduledPenalties(fetchHandler, {}, {})).rejects.toThrow("CRON_SECRET is not configured");
    expect(fetchHandler).not.toHaveBeenCalled();
  });

  it("reports a failed penalty request", async () => {
    await expect(scheduledPenalties(async () => new Response("error", { status: 500 }), { CRON_SECRET: "test-only" }, {}))
      .rejects.toThrow("HTTP 500");
  });
});
