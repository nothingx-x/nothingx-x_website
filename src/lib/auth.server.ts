import { error, redirect, type Cookies, type RequestEvent } from "@sveltejs/kit";
import type { Prisma } from "$lib/db.server";
import { env } from "$env/dynamic/private";
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
  return `${payload}.${await hmac(payload, env.SESSION_SECRET)}`;
}

/** Returns the user id if the cookie is valid and unexpired, else null. */
export async function readSession(token: string): Promise<number | null> {
  const payload = await verifySigned(token, env.SESSION_SECRET);
  if (!payload) return null;

  const [userId, expiresAt] = payload.split(".");
  if (Number(expiresAt) < Date.now()) return null;

  const id = Number(userId);
  return Number.isInteger(id) ? id : null;
}

export async function getUserById(
  prisma: Prisma,
  id: number,
): Promise<SessionUser | null> {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, role: true },
  });
}

export async function authenticate(
  prisma: Prisma,
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

// ─── Guards ─────────────────────────────────────────────

/**
 * Page guard for admin-only routes.
 *
 * Anonymous visitors are bounced to login with a return path. Authenticated
 * non-admins get a 404 rather than a 403 so the route's existence isn't
 * confirmed to them. Call this *before* any database lookup.
 */
export function requireAdmin(event: RequestEvent): SessionUser {
  const user = event.locals.user;

  if (!user) {
    const next = event.url.pathname + event.url.search;
    redirect(303, `/login?next=${encodeURIComponent(next)}`);
  }

  if (user.role !== "ADMIN") error(404, "Not found");

  return user;
}

/** API guard: same policy as `requireAdmin` but throws 404 for everyone else. */
export function isAdmin(
  locals: App.Locals,
): locals is App.Locals & { user: SessionUser } {
  return locals.user?.role === "ADMIN";
}

export function clearSession(cookies: Cookies, name = SESSION_COOKIE) {
  cookies.delete(name, { path: "/" });
}

export const SESSION_COOKIE = "session";
export const SESSION_MAX_AGE = SESSION_TTL_MS / 1000;