// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
import type { SessionUser } from "$lib/auth.server";
import type { Prisma } from "$lib/db.server";

declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: SessionUser | null;
			/** Per-request Prisma client, built in `hooks.server.ts`. */
			prisma: Prisma;
		}
		// interface PageData {}
		// interface PageState {}

		/**
		 * The Cloudflare Workers platform object supplied by
		 * `@sveltejs/adapter-cloudflare`. Declared structurally so the project
		 * does not need generated Worker types.
		 */
		interface Platform {
			env?: {
				HYPERDRIVE?: { connectionString: string };
				[key: string]: unknown;
			};
			context?: {
				waitUntil(promise: Promise<unknown>): void;
			};
			[key: string]: unknown;
		}
	}
}

export {};