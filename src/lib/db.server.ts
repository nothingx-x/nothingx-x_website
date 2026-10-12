import { PrismaClient } from "../generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * Creates a Prisma client bound to the given connection string.
 *
 * This is a factory rather than a shared singleton on purpose. On Cloudflare
 * Workers each request runs in a fresh isolate with no module-scope environment,
 * so a client constructed at import time would capture `undefined`. Callers build
 * one per request from `locals.prisma` (see `hooks.server.ts`).
 *
 * The connection string is passed in rather than read from `$env/static/private`,
 * because static env vars are inlined at build time and would be baked into the
 * deployed bundle as plaintext.
 */
export const createPrisma = (connectionString: string): PrismaClient =>
  new PrismaClient({ adapter: new PrismaPg(connectionString) });

export type Prisma = PrismaClient;