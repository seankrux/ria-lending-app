import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { GET } from "@/app/api/cron/penalties/route";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/admin", () => ({ createAdminClient: vi.fn() }));

afterEach(() => { vi.unstubAllEnvs(); vi.clearAllMocks(); });

describe("penalty cron authorization", () => {
  it.each([undefined, "", "Bearer undefined"])("rejects %s without a configured secret", async (authorization) => {
    vi.stubEnv("CRON_SECRET", undefined);
    const headers = new Headers();
    if (authorization !== undefined) headers.set("authorization", authorization);
    const response = await GET(new NextRequest("https://example.com/api/cron/penalties", { headers }));
    expect(response.status).toBe(401);
    expect(createAdminClient).not.toHaveBeenCalled();
  });
});
