import { excerpt } from "$lib/markdown.server";
import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
  const prisma = locals.prisma;
  const isAdmin = locals.user?.role === "ADMIN";

  const posts = await prisma.post.findMany({
    // drafts stay visible to admins so they can be resumed
    where: isAdmin ? {} : { published: true },
    orderBy: { createdAt: "desc" },
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
      // only whether one exists; the bytes load from the thumbnail route
      thumbnailImageRaw: true,
    },
  });

  return {
    isAdmin,
    posts: posts.map(({ contentMarkdown, thumbnailImageRaw, ...post }) => ({
      ...post,
      hasThumbnail: thumbnailImageRaw !== null,
      excerpt: excerpt(contentMarkdown),
    })),
  };
};