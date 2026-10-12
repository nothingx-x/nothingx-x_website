import type { Prisma } from "$lib/db.server";
import { isReserved, isValidSlug, slugify, uniqueSlug } from "$lib/slug";
import { MAX_UPLOAD_BYTES, sniffImageType } from "$lib/image";
import { Category } from "../generated/prisma/enums.ts";

const MAX_TITLE = 200;
const MAX_CONTENT = 100_000;

export interface PostErrors {
  form?: string;
  title?: string;
  slug?: string;
  category?: string;
  contentMarkdown?: string;
  thumbnail?: string;
}

export interface PostValues {
  title: string;
  slug: string;
  category: string;
  contentMarkdown: string;
  published: boolean;
}

/** Every reason the submission was rejected, in one throw. */
export class PostValidationError extends Error {
  constructor(
    readonly errors: PostErrors,
    readonly values: PostValues,
  ) {
    super("Validation failed");
    this.name = "PostValidationError";
  }
}

export interface ParsedPost {
  values: PostValues;
  /** null means "leave the stored thumbnail alone" — see `removeThumbnail`. */
  thumbnail: Uint8Array<ArrayBuffer> | null;
  removeThumbnail: boolean;
}

/**
 * Reads and validates a post submission.
 *
 * `excludeId` lets an edit keep its own slug when nothing changed.
 */
export async function readPostForm(
  prisma: Prisma,
  form: FormData,
  { excludeId }: { excludeId?: number } = {},
): Promise<ParsedPost> {
  const values: PostValues = {
    title: String(form.get("title") ?? "").trim(),
    slug: String(form.get("slug") ?? "").trim(),
    category: String(form.get("category") ?? "").trim().toUpperCase(),
    contentMarkdown: String(form.get("contentMarkdown") ?? ""),
    published: form.get("published") === "1",
  };

  const removeThumbnail = form.get("removeThumbnail") === "1";
  const errors: PostErrors = {};

  validateScalarFields(values, errors);

  const requested = values.slug || slugify(values.title);

  // Only resolve a unique slug once the scalar fields are known good, so a
  // typo in the title doesn't burn a database round trip.
  let thumbnail: Uint8Array<ArrayBuffer> | null = null;
  if (Object.keys(errors).length === 0) {
    values.slug = await resolveSlug(prisma, requested, excludeId);
    thumbnail = await readThumbnail(form, errors);
  }

  if (Object.keys(errors).length > 0) {
    throw new PostValidationError(errors, values);
  }

  return { values, thumbnail, removeThumbnail };
}

function validateScalarFields(values: PostValues, errors: PostErrors) {
  if (!values.title) {
    errors.title = "Title is required.";
  } else if (values.title.length > MAX_TITLE) {
    errors.title = `Title must be ${MAX_TITLE} characters or fewer.`;
  }

  if (!values.contentMarkdown.trim()) {
    errors.contentMarkdown = "Content is required.";
  } else if (values.contentMarkdown.length > MAX_CONTENT) {
    errors.contentMarkdown = `Content must be ${MAX_CONTENT} characters or fewer.`;
  }

  if (!Object.values(Category).includes(values.category as Category)) {
    errors.category = "Pick a valid category.";
  }

  if (values.slug) {
    if (isReserved(values.slug)) {
      errors.slug = "That slug is reserved by another route.";
    } else if (!isValidSlug(values.slug)) {
      errors.slug = "Use letters, numbers, and dashes only.";
    }
  }
}

async function resolveSlug(
  prisma: Prisma,
  requested: string,
  excludeId?: number,
): Promise<string> {
  return uniqueSlug(requested, async (candidate) => {
    const found = await prisma.post.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    return found !== null && found.id !== excludeId;
  });
}

/**
 * Verifies the uploaded thumbnail by its magic bytes.
 *
 * The client-declared Content-Type is never trusted. SVG and markup are
 * rejected outright, which is what keeps a stored-XSS payload from being
 * served back from our own origin.
 */
/** Prisma expects an ArrayBuffer-backed view; `arrayBuffer()` widens it. */
async function readThumbnail(
  form: FormData,
  errors: PostErrors,
): Promise<Uint8Array<ArrayBuffer> | null> {
  const value = form.get("thumbnail");
  if (!(value instanceof File) || value.size === 0) return null;

  if (value.size > MAX_UPLOAD_BYTES) {
    errors.thumbnail = `Images must be ${Math.floor(MAX_UPLOAD_BYTES / 1024 / 1024)} MB or smaller.`;
    return null;
  }

  const buffer = await value.arrayBuffer();
  const bytes = new Uint8Array(buffer) as Uint8Array<ArrayBuffer>;

  if (!sniffImageType(bytes)) {
    errors.thumbnail = "That file is not a supported image (png, jpeg, or webp).";
    return null;
  }

  return bytes;
}