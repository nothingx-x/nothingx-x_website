import type { Handle } from "@sveltejs/kit";
import {
  getUserById,
  readSession,
  SESSION_COOKIE,
} from "$lib/auth.server";

export const handle: Handle = async ({ event, resolve }) => {
  const token = event.cookies.get(SESSION_COOKIE);
  event.locals.user = null;

  if (token) {
    const userId = await readSession(token);
    if (userId) event.locals.user = await getUserById(userId);
  }

  return resolve(event);
};