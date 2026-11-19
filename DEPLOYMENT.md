# Production deployment

The full Next.js app runs on Sean's personal Cloudflare account `7a7a08127b6d6744c838413b4473ecf1`, Worker `seankrux-ria-lending-app`, using OpenNext. The deployment endpoint is `https://seankrux-ria-lending-app.seanllms.workers.dev`.

GitHub Actions runs type checking, lint, the existing lending calculations and allocation tests, the agreement PDF test, cron authorization tests, and the full OpenNext build before deploying a trusted `main` push. Set `CLOUDFLARE_API_TOKEN` in repository secrets. Set the original public Supabase settings in `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; these are included in browser assets during the build. `CLOUDFLARE_RUNTIME_ENV` privately supplies the runtime environment to Wrangler after deployment. The service-role key, debtor session key, cron key and Cloudflare credential stay on the server.

The existing penalty handler runs at `17:00 UTC` (`01:00 Asia/Manila`) through a Cloudflare Cron Trigger. Both the trigger and route reject an absent cron key. The original Noto Sans fonts remain public assets; the PDF route loads their bytes per request and registers data URLs, avoiding a server filesystem dependency or a cached cross-request network promise.

Yoga's original WASM bytes are extracted from the locked package and imported as a precompiled Worker module. The loader uses that module on Workers and the original loader during ordinary Node development. `verify:worker-pdf` exercises the built Next.js PDF endpoint in local workerd with isolated provider fixtures; the fixture wrapper is outside the production entry point and sends no database traffic.

The preparation script also bundles the PDF renderer with its regular React runtime before Next compiles the route. This preserves the custom reconciler's React internals instead of resolving them to the React Server Component runtime. Both `npm run dev` and `npm run build` prepare this generated, ignored module. See the [React PDF compatibility notes](https://react-pdf.org/docs/v4/compatibility) and [Next server package bundling reference](https://nextjs.org/docs/app/api-reference/config/next-config-js/serverExternalPackages).

The original Supabase service-role key has not been recovered from the previous provider. Borrower, penalty and administrator operations that require it stay unavailable until that exact project's server credential is supplied. Public pages and staff session checks use the original project's existing public URL and anon key.

The Vercel project is retained with Git deployment disabled. Move a production domain only after the Cloudflare root, staff login, debtor login, calculator, font assets and protected-route checks pass against the actual database configuration.
