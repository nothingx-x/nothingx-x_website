import assert from "node:assert/strict";
import { isReserved, isValidSlug, slugify, uniqueSlug } from "../src/lib/slug.ts";

let passed = 0;
const check = (name: string, fn: () => void | Promise<void>) =>
  (async () => {
    await fn();
    passed++;
    console.log(`  ok  ${name}`);
  })().catch((e) => {
    console.error(`FAIL  ${name}: ${e.message}`);
    process.exit(1);
  });

await check("slugifies latin titles", () => {
  assert.equal(slugify("Hello World"), "hello-world");
  assert.equal(slugify("  Multiple   Spaces  "), "multiple-spaces");
  assert.equal(slugify("Punctuation!!! Goes ~~here~~"), "punctuation-goes-here");
});

await check("preserves Persian titles", () => {
  const slug = slugify("سلام دنیا");
  assert.equal(slug, "سلام-دنیا");
  assert.ok(slug.length > 0, "must not be emptied out");
});

await check("keeps digits", () => {
  assert.equal(slugify("Top 10 Tips"), "top-10-tips");
});

await check("collapses and trims separators", () => {
  assert.equal(slugify("--a---b--"), "a-b");
  assert.equal(slugify("!!!"), "");
});

await check("caps length and does not end on a separator", () => {
  const slug = slugify("a".repeat(200));
  assert.ok(slug.length <= 80, `got ${slug.length}`);
  assert.ok(!slug.endsWith("-"));
});

await check("reserved slugs are detected", () => {
  for (const s of ["new", "edit", "NEW", "api", "login", "logout"]) {
    assert.equal(isReserved(s), true, s);
  }
  assert.equal(isReserved("new-post"), false);
});

await check("validates hand-typed slugs", () => {
  assert.equal(isValidSlug("hello-world"), true);
  assert.equal(isValidSlug("سلام"), true);
  assert.equal(isValidSlug(""), false);
  assert.equal(isValidSlug("new"), false, "reserved");
  assert.equal(isValidSlug("Hello World"), false, "not normalized");
  assert.equal(isValidSlug("a".repeat(200)), false, "too long");
});

await check("uniqueSlug returns the base when free", async () => {
  assert.equal(await uniqueSlug("hello", async () => false), "hello");
});

await check("uniqueSlug appends numeric suffixes", async () => {
  const taken = new Set(["hello", "hello-2", "hello-3"]);
  const slug = await uniqueSlug("hello", async (s) => taken.has(s));
  assert.equal(slug, "hello-4");
});

await check("uniqueSlug falls back when the base is empty", async () => {
  assert.equal(await uniqueSlug("", async () => false), "post");
});

await check("uniqueSlug keeps suffix within the length cap", async () => {
  const base = "a".repeat(80);
  const slug = await uniqueSlug(base, async (s) => s === base);
  assert.ok(slug.length <= 80, `got ${slug.length}`);
  assert.ok(slug.endsWith("-2"));
});

await check("uniqueSlug skips an id the caller excludes", async () => {
  // simulates editing a post: "mine" exists but it's this post, so it's free
  const existing = [{ id: 7, slug: "mine" }];
  const slug = await uniqueSlug(
    "mine",
    async (s) => existing.some((p) => p.slug === s && p.id !== 7),
  );
  assert.equal(slug, "mine");

  const other = [{ id: 8, slug: "mine" }];
  const takenSlug = await uniqueSlug(
    "mine",
    async (s) => other.some((p) => p.slug === s && p.id !== 7),
  );
  assert.equal(takenSlug, "mine-2");
});

console.log(`\n${passed} checks passed`);