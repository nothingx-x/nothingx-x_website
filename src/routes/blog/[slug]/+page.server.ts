import { error } from "@sveltejs/kit";
import { prisma } from "$lib/db.server";
import { excerpt, renderMarkdown } from "$lib/markdown.server";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params, locals }) => {
  const isAdmin = locals.user?.role === "ADMIN";

  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      slug: true,
      title: true,
      contentMarkdown: true,
      category: true,
      published: true,
      views: true,
      likes: true,
      createdAt: true,
      thumbnailImageRaw: true,
      author: { select: { name: true } },
    },
  });

  // a draft is indistinguishable from a missing post for non-admins
  if (!post || (!post.published && !isAdmin)) error(404, "Post not found");

  const { contentMarkdown, author, ...rest } = post;

  return {
    isAdmin,
    hasThumbnail: post.thumbnailImageRaw !== null,
    post: {
      ...rest,
      authorName: author.name,
      excerpt: excerpt(contentMarkdown),
      html: await renderMarkdown(contentMarkdown),
    },
  };
};