import { prisma } from "$lib/db.server";
import { SESSION_SECRET } from "$env/static/private";
import {
  dummyHash,
  hashPassword,
  hmac,
  verifyPassword,
  verifySigned,
} from "$lib/crypto";
import type { Role } from "../generated/prisma/enums.ts";

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

export { hashPassword };

// ─── Sessions ───────────────────────────────────────────

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: Role;
}

/** Builds a signed `userId.expiresAt.signature` cookie value. */
export async function createSession(userId: number): Promise<string> {
  const expiresAt = Date.now() + SESSION_TTL_MS;
  const payload = `${userId}.${expiresAt}`;
  return `${payload}.${await hmac(payload, SESSION_SECRET)}`;
}

/** Returns the user id if the cookie is valid and unexpired, else null. */
export async function readSession(token: string): Promise<number | null> {
  const payload = await verifySigned(token, SESSION_SECRET);
  if (!payload) return null;

  const [userId, expiresAt] = payload.split(".");
  if (Number(expiresAt) < Date.now()) return null;

  const id = Number(userId);
  return Number.isInteger(id) ? id : null;
}

export async function getUserById(id: number): Promise<SessionUser | null> {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function authenticate(
  email: string,
  password: string,
): Promise<SessionUser | null> {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    select: { id: true, name: true, email: true, role: true, hashedPassword: true },
  });

  if (!user) {
    // burn comparable time so the response doesn't reveal which emails exist
    await verifyPassword(password, await dummyHash());
    return null;
  }

  return (await verifyPassword(password, user.hashedPassword))
    ? { id: user.id, name: user.name, email: user.email, role: user.role }
    : null;
}

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = SESSION_TTL_MS / 1000;