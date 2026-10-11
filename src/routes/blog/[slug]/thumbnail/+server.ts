import { error } from "@sveltejs/kit";
import { prisma } from "$lib/db.server";
import { sniffImageType } from "$lib/image";
import type { RequestHandler } from "./$types";

export const GET: RequestHandler = async ({ params, locals, setHeaders }) => {
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: { thumbnailImageRaw: true, published: true },
  });

  if (!post?.thumbnailImageRaw) error(404, "No thumbnail");

  // draft thumbnails are admin-only, same rule as the draft page itself
  if (!post.published && locals.user?.role !== "ADMIN") error(404, "No thumbnail");

  const bytes = new Uint8Array(post.thumbnailImageRaw);
  const type = sniffImageType(bytes);
  if (!type) error(404, "No thumbnail");

  setHeaders({
    "content-type": type,
    "content-length": String(bytes.byteLength),
    // the type above is re-derived from magic bytes, never from user input
    "x-content-type-options": "nosniff",
    "content-disposition": "inline",
    "cache-control": "public, max-age=3600",
  });

  return new Response(bytes, { status: 200 });
};