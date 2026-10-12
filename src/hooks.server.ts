import type { Handle } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";
import { createPrisma } from "$lib/db.server";
import {
  getUserById,
  readSession,
  SESSION_COOKIE,
} from "$lib/auth.server";

/**
 * Reads the database connection string for this request.
 *
 * In production a Hyperdrive binding supplies a pooled connection string; those
 * live on `platform.env`, not in `$env/dynamic/private`. Locally there is no
 * platform object, so we fall back to `DATABASE_URL` from `.dev.vars`, which
 * keeps `npm run dev` working against a local Postgres.
 *
 * The binding is configured with `--caching-disabled`, so reads are never
 * served stale. Hyperdrive's default query cache holds results for 60s and is
 * not invalidated on write, which would keep a changed `role` row in effect for
 * up to a minute. Connection pooling still applies with caching off.
 *
 * Under `wrangler dev` the binding resolves through `localConnectionString`
 * (wrangler.jsonc), which points at localhost. The DATABASE_URL fallback covers
 * `vite dev` runs where no platform object exists.
 */
function connectionString(platform: App.Platform | undefined): string {
  const url =
    platform?.env?.HYPERDRIVE?.connectionString ?? env.DATABASE_URL;

  if (!url) {
    throw new Error(
      "No database connection string. Set DATABASE_URL in .dev.vars, " +
        "or configure a HYPERDRIVE binding for this Worker.",
    );
  }

  return url;
}

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get(SESSION_COOKIE);

  // adapter-cloudflare exposes the Workers bindings on event.platform
  const platform = event.platform as App.Platform | undefined;

  const prisma = createPrisma(connectionString(platform));
  event.locals.prisma = prisma;
  event.locals.user = null;

  try {
    if (token) {
      const userId = await readSession(token);
      if (userId) event.locals.user = await getUserById(prisma, userId);
    }

    return await resolve(event);
  } finally {
    // The pg driver holds a real TCP socket, so it must be released once the
    // response is produced. waitUntil keeps this off the response path.
    platform?.context?.waitUntil?.(prisma.$disconnect());
  }
};