import { error } from "@sveltejs/kit";
import { prisma } from "$lib/db.server";
import { excerpt, renderMarkdown } from "$lib/markdown.server";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ params }) => {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      slug: true,
      title: true,
      contentMarkdown: true,
      category: true,
      views: true,
      likes: true,
      createdAt: true,
      author: { select: { name: true } },
    },
  });

  if (!post) error(404, "Post not found");

  const { contentMarkdown, author, ...rest } = post;

  return {
    post: {
      ...rest,
      authorName: author.name,
      excerpt: excerpt(contentMarkdown),
      html: await renderMarkdown(contentMarkdown),
    },
  };
};