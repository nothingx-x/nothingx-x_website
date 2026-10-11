import { redirect, type Cookies } from "@sveltejs/kit";
import { SESSION_COOKIE } from "$lib/auth.server";
import type { Actions, PageServerLoad } from "./$types";

function clearSession(cookies: Cookies) {
  cookies.delete(SESSION_COOKIE, { path: "/" });
}

/** Nothing renders here — visiting /logout directly just bounces home. */
export const load: PageServerLoad = async () => {
  redirect(303, "/");
};

export const actions: Actions = {
  default: async ({ cookies }) => {
    clearSession(cookies);
    redirect(303, "/");
  },
};