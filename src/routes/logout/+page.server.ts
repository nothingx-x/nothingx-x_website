import { redirect } from "@sveltejs/kit";
import { clearSession } from "$lib/auth.server";
import type { Actions, PageServerLoad } from "./$types";

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