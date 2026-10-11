import { error, json } from "@sveltejs/kit";
import { isAdmin } from "$lib/auth.server";
import { renderMarkdown } from "$lib/markdown.server";
import type { RequestHandler } from "./$types";

/** Matches the editor's cap so preview can't be used as a free render service. */
const MAX_MARKDOWN = 100_000;

export const POST: RequestHandler = async ({ request, locals }) => {
  // same policy as the editor routes: anonymous users get bounced, logged-in
  // non-admins get a 404. An API client can't act on a redirect, so both end
  // up as a failed fetch for anyone who shouldn't be here.
  if (!locals.user) error(401, "Sign in to preview");
  if (!isAdmin(locals)) error(404, "Not found");

  let markdown: unknown;
  try {
    ({ markdown } = await request.json());
  } catch {
    error(400, "Expected a JSON body");
  }

  if (typeof markdown !== "string") error(400, "`markdown` must be a string");
  if (markdown.length > MAX_MARKDOWN) error(413, "Preview input is too long");

  return json({ html: await renderMarkdown(markdown) });
};