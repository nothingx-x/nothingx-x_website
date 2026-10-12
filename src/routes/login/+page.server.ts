import { fail, redirect } from "@sveltejs/kit";
import {
  authenticate,
  createSession,
  SESSION_COOKIE,
  SESSION_MAX_AGE,
} from "$lib/auth.server";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  if (locals.user) redirect(303, "/");
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies, url, locals }) => {
    const form = await request.formData();
    const email = String(form.get("email") ?? "").trim();
    const password = String(form.get("password") ?? "");
    const next = String(form.get("next") ?? "/");

    const values = { email };

    if (!email || !password) {
      return fail(400, {
        values,
        error: "Email and password are required.",
      });
    }

    const user = await authenticate(locals.prisma, email, password);

    // same message either way so we don't confirm which emails are registered
    if (!user) {
      return fail(400, {
        values,
        error: "Incorrect email or password.",
      });
    }

    cookies.set(SESSION_COOKIE, await createSession(user.id), {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: url.protocol === "https:",
      maxAge: SESSION_MAX_AGE,
    });

    // only allow same-origin relative redirects
    redirect(303, next.startsWith("/") && !next.startsWith("//") ? next : "/");
  },
};