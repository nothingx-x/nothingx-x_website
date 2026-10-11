/**
 * Slug rules for blog URLs.
 *
 * Persian titles are the common case here, and Persian characters don't
 * survive a naive ASCII slugify. We keep the Persian letters (URLs are
 * percent-encoded by the browser, so they work fine) rather than stripping a
 * title down to nothing.
 */

/** Segments that would shadow a real route. */
export const RESERVED_SLUGS = new Set(["new", "edit", "api", "login", "logout"]);

const MAX_LENGTH = 80;

/**
 * Normalises arbitrary text into a URL segment.
 * Keeps Persian/Arabic letters, digits, and `-`.
 */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    // Persian/Arabic block, Latin, and digits survive
    .replace(/[^\p{Script=Arabic}\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, MAX_LENGTH)
    .replace(/-+$/g, "");
}

export function isReserved(slug: string): boolean {
  return RESERVED_SLUGS.has(slug.toLowerCase());
}

/** Shape check for a slug a human typed by hand. */
export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length > MAX_LENGTH) return false;
  if (isReserved(slug)) return false;
  if (slug !== slugify(slug)) return false;
  return true;
}

type Exists = (slug: string) => Promise<boolean>;

/**
 * Returns `base` if free, otherwise `base-2`, `base-3`, … until one is free.
 *
 * `exists` is supplied by the caller so it can scope itself — e.g. exclude the
 * post currently being edited, so re-saving without changing the slug works.
 */
export async function uniqueSlug(base: string, exists: Exists): Promise<string> {
  const root = base || "post";

  if (!(await exists(root))) return root;

  for (let n = 2; n < 500; n++) {
    const suffix = `-${n}`;
    const candidate = `${root.slice(0, MAX_LENGTH - suffix.length)}${suffix}`;
    if (!(await exists(candidate))) return candidate;
  }

  // effectively unreachable; a 500 slug would break routing anyway
  throw new Error("Could not find a free slug");
}