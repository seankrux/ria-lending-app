import handler from "./.open-next/worker.js";
import { scheduledPenalties } from "./worker/cloudflare-cron.mjs";
import yogaModule from "./worker/yoga.wasm";

globalThis.__RIA_YOGA_MODULE__ = yogaModule;

export default {
  fetch: handler.fetch,
  scheduled: (_event, env, ctx) => scheduledPenalties(handler.fetch, env, ctx),
};
