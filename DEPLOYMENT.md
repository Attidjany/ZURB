# Deployment diagnostics

## Vercel configuration requirements
- Set `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` so Supabase clients can be initialised during requests and server actions. Without them, helpers throw runtime errors and API calls fail. See `lib/supabaseServer.ts` and `lib/supabaseClient.ts`.
- Set `NEXT_PUBLIC_SITE_URL` to the deployed domain. It is used when generating Supabase magic link redirects and sign-out responses; leaving it at the default `http://localhost:3000` breaks auth flows in production.

## Server Actions
- `next.config.mjs` currently restricts Server Actions to the Supabase URL. On Vercel the browser origin is the deployed domain, so actions such as project/site creation and GeoJSON uploads will be rejected. Update `allowedOrigins` to include your Vercel domains.
- Server actions that mutate Supabase content (e.g. geometry updates) rely on the `SUPABASE_SERVICE_ROLE_KEY`. Confirm this secret is configured in the Vercel dashboard and scoped to the appropriate functions.

## Database migrations
- Functions such as `fn_upsert_site_geometry` (referenced by `server/sites.ts`) must exist in the database. Run the SQL files under the `sql/` directory against your Supabase instance before deploying.
