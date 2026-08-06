/* Wipes ALL business data (borrowers, loans, payments, remittances, audit)
 * after writing a full JSON backup to backups/. Staff accounts and company
 * settings are kept. Usage:
 *   set -a && source .env.local && set +a && node scripts/reset-data.mjs --yes
 */
import { createClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync } from "fs";

if (!process.argv.includes("--yes")) {
  console.error("This deletes all borrowers, loans, payments, remittances, and audit history.");
  console.error("Re-run with --yes to proceed. Staff accounts and settings are kept.");
  process.exit(1);
}

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false } }
);

const TABLES = [
  // deletion order respects foreign keys
  "payment_allocations",
  "payments",
  "penalties",
  "schedule_items",
  "loans",
  "borrower_access",
  "borrowers",
  "remittances",
  "audit_log",
];

// ---------- backup ----------
const backup = { takenAt: new Date().toISOString(), tables: {} };
for (const t of TABLES) {
  const { data, error } = await admin.from(t).select("*");
  if (error) {
    console.error(`backup failed on ${t}: ${error.message}`);
    process.exit(1);
  }
  backup.tables[t] = data;
  console.log(`backed up ${t}: ${data.length} rows`);
}
mkdirSync("backups", { recursive: true });
const file = `backups/backup-${backup.takenAt.replace(/[:.]/g, "-")}.json`;
writeFileSync(file, JSON.stringify(backup, null, 1));
console.log(`\nbackup written to ${file}\n`);

// ---------- wipe ----------
const PK = { borrower_access: "borrower_id" };
for (const t of TABLES) {
  const { error } =
    t === "audit_log"
      ? await admin.from(t).delete().gte("id", 0)
      : await admin.from(t).delete().not(PK[t] ?? "id", "is", null);
  if (error) {
    console.error(`delete failed on ${t}: ${error.message}`);
    process.exit(1);
  }
  console.log(`cleared ${t}`);
}

console.log("\nDone. Staff accounts and company settings were kept.");
