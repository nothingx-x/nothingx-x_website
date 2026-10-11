const PBKDF2_ITERATIONS = 210_000;

const encoder = new TextEncoder();

function toBase64(bytes: Uint8Array): string {
  return Buffer.from(bytes).toString("base64");
}

function fromBase64(value: string): Uint8Array {
  return new Uint8Array(Buffer.from(value, "base64"));
}

export function randomBytes(length: number): Uint8Array {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
}

export function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

// ─── Passwords ──────────────────────────────────────────

async function derive(
  password: string,
  salt: Uint8Array,
  iterations: number,
): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );

  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations, hash: "SHA-256" },
    key,
    256,
  );

  return new Uint8Array(bits);
}

/** Hashes a password as `pbkdf2$<iterations>$<salt>$<hash>`. */
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const derived = await derive(password, salt, PBKDF2_ITERATIONS);
  return `pbkdf2$${PBKDF2_ITERATIONS}$${toBase64(salt)}$${toBase64(derived)}`;
}

/** Constant-time check against a stored hash. Returns false on malformed input. */
export async function verifyPassword(
  password: string,
  stored: string,
): Promise<boolean> {
  const [scheme, iterations, salt, hash] = stored.split("$");
  if (scheme !== "pbkdf2" || !iterations || !salt || !hash) return false;

  const rounds = Number(iterations);
  // deriveBits throws on a non-numeric or absurd iteration count, so gate it
  if (!Number.isInteger(rounds) || rounds < 1 || rounds > 10_000_000) {
    return false;
  }

  const expected = fromBase64(hash);
  const actual = await derive(password, fromBase64(salt), rounds);

  return timingSafeEqual(expected, actual);
}

/** Hashes a dummy password so unknown emails cost the same as real ones. */
export function dummyHash(): Promise<string> {
  return hashPassword("placeholder");
}

// ─── Signed payloads ────────────────────────────────────

export async function hmac(value: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));

  return toBase64(new Uint8Array(signature));
}

/** Verifies a `<payload>.<signature>` string produced by `hmac`. */
export async function verifySigned(
  token: string,
  secret: string,
): Promise<string | null> {
  const separator = token.lastIndexOf(".");
  if (separator <= 0) return null;

  const payload = token.slice(0, separator);
  const signature = token.slice(separator + 1);
  const expected = await hmac(payload, secret);

  return timingSafeEqual(encoder.encode(signature), encoder.encode(expected))
    ? payload
    : null;
}