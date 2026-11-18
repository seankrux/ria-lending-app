export async function scheduledPenalties(fetchHandler, env, ctx) {
  if (!env.CRON_SECRET) throw new Error("CRON_SECRET is not configured");
  const response = await fetchHandler(
    new Request("https://ria-lending.internal/api/cron/penalties", {
      headers: { authorization: `Bearer ${env.CRON_SECRET}` },
    }),
    env,
    ctx,
  );
  if (!response.ok) {
    throw new Error(`Scheduled penalties returned HTTP ${response.status}`);
  }
}
