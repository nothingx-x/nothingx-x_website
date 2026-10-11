import { prisma } from "$lib/db.server";
import { excerpt } from "$lib/markdown.server";

export async function load() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      slug: true,
      title: true,
      contentMarkdown: true,
      category: true,
      views: true,
      likes: true,
      createdAt: true,
    },
  });

  return {
    posts: posts.map(({ contentMarkdown, ...post }) => ({
      ...post,
      excerpt: excerpt(contentMarkdown),
    })),
  };
}