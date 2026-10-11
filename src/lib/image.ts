/**
 * Thumbnail handling. Two halves that deliberately don't share code:
 *
 *  - `compressImage` runs in the browser and shrinks the upload before it is
 *    ever sent, so the request body stays small enough for the platform.
 *  - `sniffImageType` runs on the server and decides what a byte string
 *    actually is. The client's `Content-Type` is attacker-controlled, so it is
 *    never used for the decision.
 */

/** Longest edge of the stored thumbnail, in pixels. */
export const MAX_DIMENSION = 1200;

export const TARGET_QUALITY = 0.60;
export const OUTPUT_MIME = "image/webp";

/** Hard ceiling on an uploaded body, enforced before parsing. */
export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

export interface CompressedImage {
  blob: Blob;
  width: number;
  height: number;
  /** Human-readable size for the UI. */
  label: string;
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Whether the re-encoded file is worth swapping in for the original.
 *
 * Re-encoding can lose: an already-optimised WebP, or a small image where
 * q=0.60 artefacts outweigh the codec win, can come out larger. In that case we
 * keep the source so a "compression" step can never make an upload bigger.
 */
export function shouldUseCompressed(originalBytes: number, compressedBytes: number): boolean {
  return compressedBytes > 0 && compressedBytes < originalBytes;
}

/**
 * Re-encodes an image to webp at or below `MAX_DIMENSION`.
 * Runs client-side only — it needs canvas and createImageBitmap.
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });

  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Canvas is unavailable in this browser.");
  }

  // No background fill: WebP carries an alpha channel, so compositing onto
  // white would both destroy transparency and add entropy to the exact region
  // that was already compressing cheaply. (JPEG sources have no alpha to lose.)
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, OUTPUT_MIME, TARGET_QUALITY),
  );

  if (!blob) throw new Error("Could not encode the image as webp.");

  return { blob, width, height, label: formatBytes(blob.size) };
}

// ─── Server-side verification ───────────────────────────

export type ImageType = "image/webp" | "image/png" | "image/jpeg";

/**
 * Identifies an image by its magic bytes.
 *
 * Deliberately does not accept SVG or anything markup-based: a stored SVG or
 * HTML body served from our origin is a stored-XSS vector, and byte sniffing
 * can't tell us a file is "really" an image. This is a format check, not a
 * decode — a crafted polyglot can still pass, which is why the serving route
 * pins the Content-Type from this result and sets `nosniff`.
 */
export function sniffImageType(bytes: Uint8Array): ImageType | null {
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) return "image/jpeg";

  if (
    bytes.length > 8 &&
    startsWith(bytes, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
  ) {
    return "image/png";
  }

  // RIFF....WEBP — 8 byte header, 4 byte size, then "WEBP"
  if (
    bytes.length > 12 &&
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    matchesAt(bytes, 8, [0x57, 0x45, 0x42, 0x50])
  ) {
    return "image/webp";
  }

  return null;
}

function startsWith(bytes: Uint8Array, signature: number[]): boolean {
  if (bytes.length < signature.length) return false;
  return signature.every((byte, i) => bytes[i] === byte);
}

function matchesAt(bytes: Uint8Array, offset: number, signature: number[]): boolean {
  if (bytes.length < offset + signature.length) return false;
  return signature.every((byte, i) => bytes[offset + i] === byte);
}