import { error, fail, redirect } from "@sveltejs/kit";
import { requireAdmin } from "$lib/auth.server";
import { readPostForm, PostValidationError } from "$lib/post.server";
import { prisma } from "$lib/db.server";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  // guard BEFORE the lookup, so a non-admin can't probe which slugs exist
  requireAdmin(event);

  const post = await prisma.post.findUnique({
    where: { slug: event.params.slug },
    select: {
      id: true,
      slug: true,
      title: true,
      category: true,
      contentMarkdown: true,
      published: true,
      updatedAt: true,
      thumbnailImageRaw: true,
    },
  });

  if (!post) error(404, "Post not found");

  return {
    post: {
      ...post,
      // bytes never reach the browser; the picker loads them from the route
      thumbnailUrl: post.thumbnailImageRaw
        ? `/blog/${post.slug}/thumbnail`
        : null,
      thumbnailImageRaw: undefined,
      updatedLabel: new Intl.DateTimeFormat("en", {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(post.updatedAt),
    },
  };
};

export const actions: Actions = {
  save: async (event) => {
    // admins may edit any post, so the returned user isn't needed here
    requireAdmin(event);

    const post = await prisma.post.findUnique({
      where: { slug: event.params.slug },
      select: { id: true },
    });

    if (!post) error(404, "Post not found");

    let parsed;
    try {
      parsed = await readPostForm(await event.request.formData(), {
        excludeId: post.id,
      });
    } catch (e) {
      if (e instanceof PostValidationError) {
        return fail(400, { errors: e.errors, values: e.values });
      }
      throw e;
    }

    const { values, thumbnail, removeThumbnail } = parsed;

    try {
      await prisma.post.update({
        where: { id: post.id },
        data: {
          title: values.title,
          slug: values.slug,
          category: values.category as never,
          contentMarkdown: values.contentMarkdown,
          published: values.published,
          // only touch the column when the admin actually changed it
          ...(thumbnail !== null && { thumbnailImageRaw: thumbnail }),
          ...(thumbnail === null &&
            removeThumbnail && { thumbnailImageRaw: null }),
        },
      });
    } catch (e) {
      if (isUniqueViolation(e)) {
        return fail(409, {
          errors: { slug: "That slug was just taken. Pick another." },
          values,
        });
      }
      throw e;
    }

    redirect(303, `/blog/${values.slug}`);
  },
};

function isUniqueViolation(e: unknown): boolean {
  return (
    typeof e === "object" &&
    e !== null &&
    (e as { code?: string }).code === "P2002"
  );
}