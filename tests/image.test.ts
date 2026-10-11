import assert from "node:assert/strict";
import {
  formatBytes,
  shouldUseCompressed,
  sniffImageType,
  MAX_DIMENSION,
  MAX_UPLOAD_BYTES,
} from "../src/lib/image.ts";

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

const bytes = (...values: number[]) => new Uint8Array(values);

await check("detects webp via RIFF/WEBP", () => {
  const webp = new Uint8Array(16);
  webp.set([0x52, 0x49, 0x46, 0x46], 0); // RIFF
  webp.set([0x57, 0x45, 0x42, 0x50], 8); // WEBP
  assert.equal(sniffImageType(webp), "image/webp");
});

await check("detects png and jpeg", () => {
  assert.equal(
    sniffImageType(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00)),
    "image/png",
  );
  assert.equal(sniffImageType(bytes(0xff, 0xd8, 0xff, 0xe0, 0x00)), "image/jpeg");
});

await check("rejects svg and markup", () => {
  const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"/>');
  assert.equal(sniffImageType(svg), null);

  const html = new TextEncoder().encode("<!DOCTYPE html><script>alert(1)</script>");
  assert.equal(sniffImageType(html), null);
});

await check("rejects truncated and empty input", () => {
  assert.equal(sniffImageType(new Uint8Array(0)), null);
  assert.equal(sniffImageType(bytes(0xff)), null);
  assert.equal(sniffImageType(bytes(0x89, 0x50)), null);
  // RIFF present but too short to reach the WEBP marker
  assert.equal(sniffImageType(bytes(0x52, 0x49, 0x46, 0x46)), null);
});

await check("rejects RIFF containers that aren't WEBP", () => {
  const wav = new Uint8Array(16);
  wav.set([0x52, 0x49, 0x46, 0x46], 0);
  wav.set([0x57, 0x41, 0x56, 0x45], 8); // WAVE
  assert.equal(sniffImageType(wav), null);
});

await check("formats byte sizes", () => {
  assert.equal(formatBytes(512), "512 B");
  assert.equal(formatBytes(2048), "2 KB");
  assert.equal(formatBytes(5 * 1024 * 1024), "5.0 MB");
});

await check("upload cap is sane", () => {
  assert.ok(MAX_UPLOAD_BYTES > 0 && MAX_UPLOAD_BYTES <= 10 * 1024 * 1024);
});

await check("swaps in the compressed file only when it is smaller", () => {
  assert.equal(shouldUseCompressed(1000, 400), true);
  assert.equal(shouldUseCompressed(1000, 999), true);
  // equal is not "smaller"; a tie means we keep the source
  assert.equal(shouldUseCompressed(1000, 1000), false);
  assert.equal(shouldUseCompressed(1000, 1200), false);
});

await check("rejects an empty compression result", () => {
  assert.equal(shouldUseCompressed(1000, 0), false);
});

await check("dimension cap leaves room under the body limit", () => {
  assert.ok(MAX_DIMENSION > 0);
  assert.ok(MAX_DIMENSION <= 2000, `got ${MAX_DIMENSION}`);
});

console.log(`\n${passed} checks passed`);