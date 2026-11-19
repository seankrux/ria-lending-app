const nativeFetch = globalThis.fetch.bind(globalThis);

const worker = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (!["127.0.0.1", "localhost"].includes(url.hostname)) {
      return new Response("Local fixture only", { status: 403 });
    }
    globalThis.fetch = async (input) => {
      const target = new URL(typeof input === "string" || input instanceof URL ? input : input.url);
      if (target.protocol === "data:" && target.pathname.startsWith("font/ttf;base64,")) return nativeFetch(input);
      if (target.pathname.startsWith("/fonts/")) return env.ASSETS.fetch(new Request(target));
      if (!target.hostname.endsWith(".supabase.co")) throw new Error("Unexpected outbound request in the local PDF test");
      if (target.pathname === "/auth/v1/user") {
        return Response.json({ id: "00000000-0000-4000-8000-000000000001", aud: "authenticated", role: "authenticated", email: "pdf-test@example.invalid", app_metadata: {}, user_metadata: {} });
      }
      if (target.pathname === "/rest/v1/loans") {
        return Response.json({
          id: "pdf-test", loan_number: "PDF-TEST-001", interest_method: "flat_addon", principal_centavos: 100000,
          interest_rate_bps: 100, fixed_interest_centavos: null, payment_frequency: "monthly", term_periods: 1,
          processing_fee_centavos: 0, release_date: "2026-11-18", first_due_date: "2026-12-18",
          total_interest_centavos: 1000, total_payable_centavos: 101000, penalty_rate_bps: 0, penalty_grace_days: 0,
          borrowers: { full_name: "Sample Borrower", phone: "+639000000000" },
        });
      }
      if (target.pathname === "/rest/v1/company_settings") {
        return Response.json({ id: 1, company_name: "PDF Test Company", address: "Manila" });
      }
      if (target.pathname === "/rest/v1/schedule_items") {
        return Response.json([{ seq: 1, due_date: "2026-12-18", total_due_centavos: 101000 }]);
      }
      throw new Error(`Unexpected provider path in the local PDF test: ${target.pathname}`);
    };
    const { default: handler } = await import("../cloudflare-worker.mjs");
    return handler.fetch(request, env, ctx);
  },
};

export default worker;
