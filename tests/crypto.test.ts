import assert from "node:assert/strict";
import {
  hashPassword,
  verifyPassword,
  hmac,
  verifySigned,
  timingSafeEqual,
} from "../src/lib/crypto.ts";

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

const SECRET = "test-secret-value";

await check("password round-trips", async () => {
  const hash = await hashPassword("correct horse battery staple");
  assert.equal(await verifyPassword("correct horse battery staple", hash), true);
});

await check("wrong password is rejected", async () => {
  const hash = await hashPassword("hunter2");
  assert.equal(await verifyPassword("hunter3", hash), false);
});

await check("identical passwords get different hashes (random salt)", async () => {
  const a = await hashPassword("same");
  const b = await hashPassword("same");
  assert.notEqual(a, b);
});

await check("malformed hashes are rejected, not thrown on", async () => {
  for (const bad of ["", "nope", "pbkdf2$1000", "bcrypt$1$2$3$4", "pbkdf2$x$y$z"]) {
    assert.equal(await verifyPassword("whatever", bad), false, bad);
  }
});

await check("signed payload round-trips", async () => {
  const payload = "42.9999999999999";
  const token = `${payload}.${await hmac(payload, SECRET)}`;
  assert.equal(await verifySigned(token, SECRET), payload);
});

await check("tampered payload is rejected", async () => {
  const payload = "42.9999999999999";
  const sig = await hmac(payload, SECRET);
  assert.equal(await verifySigned(`999.9999999999999.${sig}`, SECRET), null);
});

await check("tampered signature is rejected", async () => {
  const token = `42.9999999999999.${await hmac("42.9999999999999", SECRET)}`;
  const forged = token.slice(0, -4) + "AAAA";
  assert.equal(await verifySigned(forged, SECRET), null);
});

await check("token signed with another secret is rejected", async () => {
  const payload = "42.9999999999999";
  const token = `${payload}.${await hmac(payload, "other-secret")}`;
  assert.equal(await verifySigned(token, SECRET), null);
});

await check("garbage tokens are rejected", async () => {
  for (const bad of ["", ".", "abc", "...", "a.b", "."]) {
    assert.equal(await verifySigned(bad, SECRET), null, bad);
  }
});

await check("signature with trailing dot does not confuse parsing", async () => {
  const payload = "1.2";
  const sig = await hmac(payload, SECRET);
  // lastIndexOf must key off the FINAL dot
  const token = `${payload}.${sig}`;
  assert.equal(await verifySigned(token, SECRET), payload);
});

await check("timingSafeEqual compares content", () => {
  const a = new Uint8Array([1, 2, 3]);
  assert.equal(timingSafeEqual(a, new Uint8Array([1, 2, 3])), true);
  assert.equal(timingSafeEqual(a, new Uint8Array([1, 2, 4])), false);
  assert.equal(timingSafeEqual(a, new Uint8Array([1, 2])), false);
});

console.log(`\n${passed} checks passed`);