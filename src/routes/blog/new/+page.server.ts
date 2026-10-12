import { fail, redirect } from "@sveltejs/kit";
import { requireAdmin } from "$lib/auth.server";
import { readPostForm, PostValidationError } from "$lib/post.server";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  // guard first: a non-admin should not learn that this route exists
  requireAdmin(event);
  return {};
};

export const actions: Actions = {
  create: async (event) => {
    const user = requireAdmin(event);
    const prisma = event.locals.prisma;

    let parsed;
    try {
      parsed = await readPostForm(prisma, await event.request.formData());
    } catch (e) {
      if (e instanceof PostValidationError) {
        return fail(400, { errors: e.errors, values: e.values });
      }
      throw e;
    }

    const { values, thumbnail } = parsed;

    let post;
    try {
      post = await prisma.post.create({
        data: {
          title: values.title,
          slug: values.slug,
          category: values.category as never,
          contentMarkdown: values.contentMarkdown,
          published: values.published,
          authorId: user.id,
          thumbnailImageRaw: thumbnail,
        },
        select: { slug: true },
      });
    } catch (e) {
      // unique-slug race: two admins saving the same slug at once
      if (isUniqueViolation(e)) {
        return fail(409, {
          errors: { slug: "That slug was just taken. Pick another." },
          values,
        });
      }
      throw e;
    }

    // outside the try: redirect() throws, and must not be caught above
    redirect(303, `/blog/${post.slug}`);
  },
};

function isUniqueViolation(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    (e as { code?: string }).code === "P2002"
  );
}