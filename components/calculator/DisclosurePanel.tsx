import { formatPeso } from "@/lib/interest/money";
import {
  formatRatePct,
  type DisclosureFigures,
} from "@/lib/interest/disclosure";
import { RateGapMeter } from "./RateGapMeter";

/**
 * Truth in Lending Act (RA 3765) disclosure block.
 *
 * Deliberately reads as a document rather than a dashboard widget: a bordered
 * sheet with a ruled key/value list. Borrowers and collectors see this next to a
 * printed promissory note, so it should look like the same class of object.
 */
export function DisclosurePanel({
  disclosure,
  quotedMonthlyRatePct,
}: {
  disclosure: DisclosureFigures;
  quotedMonthlyRatePct: number;
}) {
  const understated =
    !disclosure.indeterminate &&
    disclosure.effectiveMonthlyRatePct > quotedMonthlyRatePct + 0.01;

  /*
   * When the solver cannot resolve a rate its numeric fields are zero, and
   * printing "0.00%" beside "the effective rate could not be computed" would be
   * both contradictory and the single most misleading value to show a borrower.
   * The money figures above stay valid either way, so only the rates blank out.
   */
  const rate = (pct: number) =>
    disclosure.indeterminate ? "—" : formatRatePct(pct);

  return (
    <section
      aria-labelledby="disclosure-heading"
      className="surface-card animate-rise overflow-hidden"
    >
      <div className="border-b border-line bg-sunken px-5 py-3">
        <h2 id="disclosure-heading" className="eyebrow text-ink-500">
          Disclosure Statement
        </h2>
        <p className="mt-0.5 text-sm text-ink-600">
          Required by the Truth in Lending Act (RA 3765)
        </p>
      </div>

      <dl className="divide-y divide-line">
        <Row
          term="Amount financed"
          detail="Cash actually received, after any processing fee"
          value={formatPeso(disclosure.amountFinanced)}
        />
        <Row
          term="Finance charge"
          detail="Everything paid above the amount financed"
          value={formatPeso(disclosure.financeCharge)}
        />
        <Row
          term="Finance charge as % of amount financed"
          detail="Over the full term of the loan"
          value={formatRatePct(disclosure.financeChargePct)}
        />
        <Row
          term="Effective interest rate — per month"
          detail="The real cost of the money you are still holding"
          value={rate(disclosure.effectiveMonthlyRatePct)}
          emphasis
        />
        <Row
          term="Effective interest rate — per year"
          detail="Compounded, for comparison against any other lender"
          value={rate(disclosure.effectiveAnnualRatePct)}
          emphasis
        />
        <Row
          term="Simple annual rate (APR)"
          detail="Uncompounded, the convention used on most loan adverts"
          value={rate(disclosure.nominalAnnualRatePct)}
        />
      </dl>

      {!disclosure.indeterminate && (
        <RateGapMeter
          quotedMonthlyRatePct={quotedMonthlyRatePct}
          effectiveMonthlyRatePct={disclosure.effectiveMonthlyRatePct}
        />
      )}

      {understated && (
        <p className="surface-warn rounded-none border-x-0 border-b-0 px-5 py-3 text-sm">
          <span className="font-semibold">
            Why is this higher than the quoted rate?
          </span>{" "}
          The quoted {formatRatePct(quotedMonthlyRatePct)} per month is charged
          on the <em>original</em> amount for the whole term, but the balance
          shrinks with every payment. The effective rate prices what is actually
          still owed.
        </p>
      )}

      {disclosure.indeterminate && (
        <p className="border-t border-line bg-sunken px-5 py-3 text-sm text-ink-600">
          The effective rate could not be computed for these terms.
        </p>
      )}
    </section>
  );
}

function Row({
  term,
  detail,
  value,
  emphasis,
}: {
  term: string;
  detail: string;
  value: string;
  emphasis?: boolean;
}) {
  // Stacked on narrow screens: a long term against a long value ("over
  // 1,000,000%") squeezes both into a handful of characters per line when they
  // sit side by side on a phone. Side-by-side returns once there is room.
  return (
    <div className="flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
      <dt>
        <span
          className={emphasis ? "font-semibold text-ink-900" : "text-ink-800"}
        >
          {term}
        </span>
        <span className="mt-0.5 block text-sm text-ink-600">{detail}</span>
      </dt>
      <dd
        className={`shrink-0 tabular-nums sm:text-right ${
          emphasis
            ? "font-display text-xl font-bold text-ink-900"
            : "text-lg font-semibold text-ink-800"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
