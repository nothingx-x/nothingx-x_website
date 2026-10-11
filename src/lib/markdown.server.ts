import { marked } from "marked";
import DOMPurify from "isomorphic-dompurify";

marked.use({ gfm: true, breaks: false });

/**
 * Renders trusted-author markdown to sanitized HTML.
 * Server-only so `marked` never reaches the client bundle.
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const raw = await marked.parse(markdown);
  return DOMPurify.sanitize(raw);
}

/** Strips markdown down to plain text, for excerpts and meta descriptions. */
export function excerpt(markdown: string, length = 140): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_`~|-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return text.length > length ? `${text.slice(0, length).trimEnd()}…` : text;
}