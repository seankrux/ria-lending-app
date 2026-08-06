/* Seeds a realistic sample dataset for demoing RIA Lending. Run AFTER
 * scripts/reset-data.mjs. Uses existing staff accounts (owner + collector).
 *   set -a && source .env.local && set +a && node scripts/seed-sample.mjs
 * Portal demo login -> phone: 0917 000 1001, code: 123456
 */
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";

const SIGNATURE = "data:image/png;base64,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";

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

// ---------- date helpers (Manila calendar dates) ----------
const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Manila" }).format(new Date());
function addDays(ymd, n) {
  const [y, m, d] = ymd.split("-").map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return t.toISOString().slice(0, 10);
}
function addMonths(ymd, n) {
  const [y, m, d] = ymd.split("-").map(Number);
  const total = m - 1 + n;
  const ty = y + Math.floor(total / 12);
  const tm = ((total % 12) + 12) % 12;
  const last = new Date(Date.UTC(ty, tm + 1, 0)).getUTCDate();
  return `${ty}-${String(tm + 1).padStart(2, "0")}-${String(Math.min(d, last)).padStart(2, "0")}`;
}

// ---------- schedule builders (mirror the app engine's rules) ----------
function evenSplit(total, n) {
  const share = Math.round(total / n);
  const out = new Array(n).fill(share);
  out[n - 1] = total - share * (n - 1);
  return out;
}
function buildSchedule({ principal, interest, n, firstDue, stepper }) {
  const prin = evenSplit(principal, n);
  const intr = evenSplit(interest, n);
  const rows = [];
  let due = firstDue;
  for (let i = 0; i < n; i++) {
    rows.push({ seq: i + 1, due_date: due, principal_due: prin[i], interest_due: intr[i], total_due: prin[i] + intr[i] });
    due = stepper(due);
  }
  return rows;
}
function diminishingSchedule({ principal, ratePerPeriodBps, n, firstDue, stepper }) {
  const i = ratePerPeriodBps / 10000;
  const pmt = (principal * i) / (1 - Math.pow(1 + i, -n));
  const rows = [];
  let remaining = principal;
  let due = firstDue;
  for (let k = 0; k < n; k++) {
    const interest = Math.round(remaining * i);
    const principalPart = k === n - 1 ? remaining : Math.min(Math.round(pmt) - interest, remaining);
    rows.push({ seq: k + 1, due_date: due, principal_due: principalPart, interest_due: interest, total_due: principalPart + interest });
    remaining -= principalPart;
    due = stepper(due);
  }
  return rows;
}
const monthly = (d) => addMonths(d, 1);
const daily = (d) => addDays(d, 1);
const semiMonthly = (d) => {
  const [y, m, day] = d.split("-").map(Number);
  const eom = new Date(Date.UTC(y, m, 0)).getUTCDate();
  if (day < 15) return `${y}-${String(m).padStart(2, "0")}-15`;
  if (day < eom) return `${y}-${String(m).padStart(2, "0")}-${eom}`;
  return addMonths(`${y}-${String(m).padStart(2, "0")}-15`, 1).slice(0, 8) + "15";
};

// ---------- staff ----------
const { data: profiles } = await admin.from("profiles").select("id, full_name, role").eq("is_active", true);
const owner = profiles.find((p) => p.role === "owner") ?? profiles.find((p) => p.role === "super_admin");
const collector = profiles.find((p) => p.role === "collector") ?? owner;
const manager = profiles.find((p) => p.role === "manager") ?? owner;
console.log(`owner: ${owner.full_name} · collector: ${collector.full_name}`);

// ---------- borrowers ----------
const BORROWERS = [
  ["Maria Santos", "+639170001001", "123 Mabini St, Quezon City", "UMID", "0028-1234567-8"],
  ["Juan dela Cruz", "+639170001002", "45 Rizal Ave, Caloocan", "Driver's License", "N01-23-456789"],
  ["Ana Reyes", "+639170001003", "78 Bonifacio St, Makati", "PhilHealth", "12-345678901-2"],
  ["Pedro Bautista", "+639170001004", "9 Aguinaldo Hwy, Cavite", "UMID", "0028-7654321-0"],
  ["Liza Garcia", "+639170001005", "234 Del Pilar St, Manila", "Passport", "P1234567A"],
  ["Carlos Mendoza", "+639170001006", "56 Luna St, Pasig", "Voter's ID", "4567-8901-2345"],
  ["Rosa Aquino", "+639170001007", "12 Katipunan Ave, Marikina", "UMID", "0028-1111222-3"],
  ["Miguel Torres", "+639170001008", "89 Ortigas Ave, Mandaluyong", "Driver's License", "N02-34-567890"],
  ["Elena Villanueva", "+639170001009", "3 Taft Ave, Pasay", "PhilHealth", "12-999888777-6"],
  ["Ramon Castillo", "+639170001010", "67 EDSA, San Juan", "UMID", "0028-3333444-5"],
];
const borrowerIds = {};
for (const [full_name, phone, address, id_type, id_number] of BORROWERS) {
  const { data, error } = await admin
    .from("borrowers")
    .insert({ full_name, phone, address, id_type, id_number, notes: "[SAMPLE DATA]", created_by: collector.id })
    .select("id")
    .single();
  if (error) throw new Error(`borrower ${full_name}: ${error.message}`);
  borrowerIds[full_name] = data.id;
}
console.log(`borrowers: ${BORROWERS.length}`);

// ---------- loan + payment helpers ----------
async function createLoan({ borrower, method, principal, rateBps = null, fixedInterest = null, frequency, n, releaseDate, schedule, status = "active", releasedBy = null, collectorId = collector.id, fee = 0 }) {
  const totalInterest = schedule.reduce((a, r) => a + r.interest_due, 0);
  const { data: loanId, error } = await admin.rpc("create_loan_with_schedule", {
    p_initial_status: status === "active" || status === "paid" ? "active" : status,
    p_borrower_id: borrowerIds[borrower],
    p_interest_method: method,
    p_principal_centavos: principal,
    p_interest_rate_bps: rateBps,
    p_fixed_interest_centavos: fixedInterest,
    p_payment_frequency: frequency,
    p_term_periods: n,
    p_processing_fee_centavos: fee,
    p_release_date: releaseDate,
    p_first_due_date: schedule[0].due_date,
    p_total_interest_centavos: totalInterest,
    p_total_payable_centavos: principal + totalInterest,
    p_penalty_rate_bps: 500,
    p_penalty_grace_days: 3,
    p_created_by: collectorId,
    p_schedule: schedule,
  });
  if (error) throw new Error(`loan for ${borrower}: ${error.message}`);
  const patch = { collector_id: collectorId };
  if (status === "active" || status === "paid" || status === "approved") {
    patch.approved_by = manager.id;
    patch.approved_at = new Date(Date.parse(releaseDate) - 86400000).toISOString();
  }
  if (status === "active" || status === "paid") {
    patch.released_by = releasedBy ?? owner.id;
    patch.released_at = new Date(Date.parse(releaseDate)).toISOString();
  }
  await admin.from("loans").update(patch).eq("id", loanId);
  await admin.from("audit_log").insert({ actor_id: collectorId, action: "loan.create", entity: "loans", entity_id: loanId, detail: { seeded: true } });
  return loanId;
}

async function payInstallments(loanId, count, { method = "cash", collectorId = collector.id } = {}) {
  const { data: items } = await admin
    .from("schedule_items").select("*").eq("loan_id", loanId)
    .in("status", ["pending", "partial"]).order("seq");
  for (let k = 0; k < Math.min(count, items.length); k++) {
    const it = items[k];
    const amt = it.total_due_centavos - it.paid_centavos;
    const isCash = method === "cash" || (method === "mix" && k % 3 !== 1);
    const { data: pid, error } = await admin.rpc("apply_payment", {
      p_loan_id: loanId,
      p_amount_centavos: amt,
      p_payment_date: it.due_date > today ? today : it.due_date,
      p_method: isCash ? "cash" : "gcash",
      p_reference_no: isCash ? null : `GC-${String(Math.floor(1e9 + (k + 1) * 7919 * 12345) % 1e10).padStart(10, "0")}`,
      p_received_by: collectorId,
      p_note: null,
      p_item_allocations: [{ id: it.id, amount: amt }],
      p_penalty_allocations: [],
      p_collector_id: collectorId,
      p_signature_data: isCash ? SIGNATURE : null,
    });
    if (error) throw new Error(`payment on ${loanId}: ${error.message}`);
    await admin.from("audit_log").insert({ actor_id: collectorId, action: "payment.record", entity: "payments", entity_id: pid, detail: { seeded: true, amount: amt } });
  }
}

// ---------- the portfolio ----------
// L1 Maria: flat add-on 20k, 5%/mo x6 monthly, released 3 months ago; 2 paid, 3rd due TODAY
const l1 = await createLoan({
  borrower: "Maria Santos", method: "flat_addon", principal: 2000000, rateBps: 500,
  frequency: "monthly", n: 6, releaseDate: addMonths(today, -3),
  schedule: buildSchedule({ principal: 2000000, interest: 600000, n: 6, firstDue: addMonths(today, -2), stepper: monthly }),
});
await payInstallments(l1, 2, { method: "mix" });

// L2 Juan: daily hulugan 5k, 0.5%/day x40, released 30 days ago; 15 paid, rest overdue
const l2 = await createLoan({
  borrower: "Juan dela Cruz", method: "per_period_flat", principal: 500000, rateBps: 50,
  frequency: "daily", n: 40, releaseDate: addDays(today, -30),
  schedule: buildSchedule({ principal: 500000, interest: 100000, n: 40, firstDue: addDays(today, -29), stepper: daily }),
});
await payInstallments(l2, 15, { method: "cash" });

// L3 Ana: one-time fixed 10k -> 12k, 4 semi-monthly, released ~5 weeks ago; 2 paid
const l3 = await createLoan({
  borrower: "Ana Reyes", method: "one_time_fixed", principal: 1000000, fixedInterest: 200000,
  frequency: "semi_monthly", n: 4, releaseDate: addDays(today, -37),
  schedule: buildSchedule({ principal: 1000000, interest: 200000, n: 4, firstDue: semiMonthly(addDays(today, -37)), stepper: semiMonthly }),
});
await payInstallments(l3, 2, { method: "mix" });

// L4 Pedro: diminishing 50k, 3%/mo x12, released 2 months ago; 2 paid
const l4 = await createLoan({
  borrower: "Pedro Bautista", method: "diminishing", principal: 5000000, rateBps: 300,
  frequency: "monthly", n: 12, releaseDate: addMonths(today, -2), fee: 100000,
  schedule: diminishingSchedule({ principal: 5000000, ratePerPeriodBps: 300, n: 12, firstDue: addMonths(today, -1), stepper: monthly }),
});
await payInstallments(l4, 2, { method: "mix" });

// L5 Liza: small loan fully paid
const l5 = await createLoan({
  borrower: "Liza Garcia", method: "one_time_fixed", principal: 500000, fixedInterest: 100000,
  frequency: "monthly", n: 2, releaseDate: addMonths(today, -3),
  schedule: buildSchedule({ principal: 500000, interest: 100000, n: 2, firstDue: addMonths(today, -2), stepper: monthly }),
});
await payInstallments(l5, 2, { method: "cash" });

// L6 Carlos: proposal awaiting approval (by collector)
await createLoan({
  borrower: "Carlos Mendoza", method: "flat_addon", principal: 1500000, rateBps: 500,
  frequency: "monthly", n: 5, releaseDate: today, status: "pending_approval",
  schedule: buildSchedule({ principal: 1500000, interest: 375000, n: 5, firstDue: addMonths(today, 1), stepper: monthly }),
});

// L7 Rosa: approved, awaiting cash release
await createLoan({
  borrower: "Rosa Aquino", method: "one_time_fixed", principal: 800000, fixedInterest: 160000,
  frequency: "semi_monthly", n: 4, releaseDate: today, status: "approved",
  schedule: buildSchedule({ principal: 800000, interest: 160000, n: 4, firstDue: semiMonthly(today), stepper: semiMonthly }),
});

// L8 Miguel: rejected proposal
const l8 = await createLoan({
  borrower: "Miguel Torres", method: "flat_addon", principal: 3000000, rateBps: 700,
  frequency: "monthly", n: 6, releaseDate: today, status: "pending_approval",
  schedule: buildSchedule({ principal: 3000000, interest: 1260000, n: 6, firstDue: addMonths(today, 1), stepper: monthly }),
});
await admin.from("loans").update({
  status: "rejected", rejected_by: manager.id, rejected_at: new Date().toISOString(),
  rejection_reason: "Requested amount too high for a first loan — advise to reapply for ₱15,000.",
}).eq("id", l8);

// ---------- penalties for the overdue hulugan (same math as the daily cron) ----------
const { data: overdueItems } = await admin
  .from("schedule_items").select("id, due_date, total_due_centavos")
  .eq("loan_id", l2).in("status", ["pending", "partial"]).lt("due_date", today);
const penRows = [];
for (const it of overdueItems) {
  const first = addDays(it.due_date, 4); // 3-day grace + 1
  if (first > today) continue;
  const daysSince = Math.round((Date.parse(today) - Date.parse(first)) / 86400000);
  const count = 1 + Math.floor(daysSince / 1);
  for (let k = 0; k < Math.min(count, 3); k++) {
    penRows.push({
      loan_id: l2, schedule_item_id: it.id,
      amount_centavos: Math.round(it.total_due_centavos * 0.05),
      assessed_on: addDays(first, k), reason: "late_payment",
    });
  }
}
if (penRows.length) {
  await admin.from("penalties").upsert(penRows, { onConflict: "schedule_item_id,assessed_on", ignoreDuplicates: true });
}
console.log(`penalties: ${penRows.length}`);

// ---------- remittances ----------
const { data: yPays } = await admin
  .from("payments").select("amount_centavos").eq("payment_date", addDays(today, -1)).is("voided_at", null);
const yTotal = (yPays ?? []).reduce((a, p) => a + p.amount_centavos, 0);
if (yTotal > 0) {
  await admin.from("remittances").insert({
    collector_id: collector.id, remit_date: addDays(today, -1), amount_centavos: yTotal,
    note: "[SAMPLE] full turnover", status: "confirmed", submitted_by: collector.id,
    confirmed_by: owner.id, confirmed_at: new Date().toISOString(),
  });
}
await admin.from("remittances").insert({
  collector_id: collector.id, remit_date: today, amount_centavos: 150000,
  note: "[SAMPLE] partial — will complete after last route", status: "submitted", submitted_by: collector.id,
});

// ---------- portal access for Maria ----------
await admin.from("borrower_access").upsert({
  borrower_id: borrowerIds["Maria Santos"],
  access_code_hash: await bcrypt.hash("123456", 10),
});

const { count: loanCount } = await admin.from("loans").select("id", { count: "exact", head: true });
const { count: payCount } = await admin.from("payments").select("id", { count: "exact", head: true });
console.log(`\nSeeded: ${BORROWERS.length} borrowers, ${loanCount} loans, ${payCount} payments.`);
console.log("Portal demo → phone: 0917 000 1001, code: 123456");
