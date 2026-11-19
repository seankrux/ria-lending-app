import { readFile } from "node:fs/promises";
import { createElement, type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { afterEach, expect, it, vi } from "vitest";
import { AgreementDocument, registerAgreementFonts, type AgreementProps } from "@/lib/pdf/AgreementDocument";

afterEach(() => vi.unstubAllGlobals());

it("renders the original agreement with fonts fetched as public assets", async () => {
  const fetchFont = vi.fn(async (input: URL) => {
    const bytes = await readFile(new URL(`../public${input.pathname}`, import.meta.url));
    return new Response(new Uint8Array(bytes));
  });
  const nativeFetch = globalThis.fetch;
  vi.stubGlobal("fetch", (input: RequestInfo | URL, init?: RequestInit) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    // Node's Yoga loader reads its embedded WASM through a data URL.
    if (url.protocol === "data:") return nativeFetch(input, init);
    expect(url.origin).toBe("https://lending.example.com");
    return fetchFont(url);
  });
  await registerAgreementFonts("https://lending.example.com");
  const agreement: AgreementProps = {
    company: { company_name: "PDF Test Company", address: "Manila" },
    borrower: { full_name: "Sample Borrower", phone: "+639000000000" },
    loan: {
      loan_number: "PDF-TEST-001", interest_method: "flat_addon", principal_centavos: 100000,
      interest_rate_bps: 100, fixed_interest_centavos: null, payment_frequency: "monthly",
      term_periods: 1, processing_fee_centavos: 0, release_date: "2026-11-18", first_due_date: "2026-12-18",
      total_interest_centavos: 1000, total_payable_centavos: 101000, penalty_rate_bps: 0, penalty_grace_days: 0,
    },
    rows: [{ seq: 1, due_date: "2026-12-18", total_due_centavos: 101000 }],
  };
  const pdf = await renderToBuffer(createElement(AgreementDocument, agreement) as unknown as ReactElement<DocumentProps>);
  expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
  expect(pdf.length).toBeGreaterThan(5000);
  expect(fetchFont.mock.calls.map(([url]) => url.pathname).sort())
    .toEqual(["/fonts/NotoSans-Bold.ttf", "/fonts/NotoSans-Regular.ttf"]);
}, 20000);
