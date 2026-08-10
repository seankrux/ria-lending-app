import { formatRatePct } from "@/lib/interest/disclosure";

/**
 * Two bars: what the loan is quoted at, and what it actually costs per month.
 *
 * The gap between them *is* the argument the Truth in Lending Act exists to
 * make, so it gets shown rather than left as two numbers a borrower has to
 * subtract in their head.
 *
 * Bar geometry is computed here from the rates and written inline; the CSS
 * animation only scales toward that already-correct width. Nothing is measured
 * from the DOM at animation time, and the global reduced-motion rule collapses
 * the animation to an identical end state.
 */
export function RateGapMeter({
  quotedMonthlyRatePct,
  effectiveMonthlyRatePct,
}: {
  quotedMonthlyRatePct: number;
  effectiveMonthlyRatePct: number;
}) {
  const max = Math.max(quotedMonthlyRatePct, effectiveMonthlyRatePct);
  if (!Number.isFinite(max) || max <= 0) return null;

  // On genuinely extreme terms the quoted rate is a rounding error next to the
  // real one, and a bar scaled honestly to ~0% reads as a rendering fault
  // rather than as the point being made. Keep a visible stub.
  const scale = (pct: number) => Math.max(2, (pct / max) * 100);

  return (
    <div className="border-t border-line px-5 py-4">
      <p className="eyebrow mb-3 text-ink-500">
        Monthly cost — quoted vs. actual
      </p>
      <Bar
        label="Quoted"
        value={formatRatePct(quotedMonthlyRatePct)}
        widthPct={scale(quotedMonthlyRatePct)}
        fill="bg-ink-300"
        delayMs={0}
      />
      <Bar
        label="Actual"
        value={formatRatePct(effectiveMonthlyRatePct)}
        widthPct={scale(effectiveMonthlyRatePct)}
        fill="bg-brand-700"
        delayMs={140}
      />
    </div>
  );
}

function Bar({
  label,
  value,
  widthPct,
  fill,
  delayMs,
}: {
  label: string;
  value: string;
  widthPct: number;
  fill: string;
  delayMs: number;
}) {
  return (
    <div className="mb-2 flex items-center gap-3 last:mb-0">
      <span className="w-16 shrink-0 text-sm text-ink-600">{label}</span>
      <span className="h-3 min-w-0 flex-1 overflow-hidden rounded-full bg-sunken">
        <span
          className={`animate-grow-x block h-full rounded-full ${fill}`}
          style={
            {
              width: `${widthPct}%`,
              "--rise-delay": `${delayMs}ms`,
            } as React.CSSProperties
          }
        />
      </span>
      <span className="w-20 shrink-0 text-right text-sm font-semibold tabular-nums text-ink-900">
        {value}
      </span>
    </div>
  );
}
