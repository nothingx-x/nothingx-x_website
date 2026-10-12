import { Marked } from "marked";

/** Schemes a rendered `href`/`src` is allowed to carry. */
const SAFE_SCHEMES = new Set(["http:", "https:", "mailto:"]);

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => HTML_ESCAPES[char]);
}

const CHARACTER_REFERENCE = /&#(?:x([0-9a-f]{1,6})|(\d{1,7}));?/gi;
const PERCENT_ESCAPE = /%([0-9a-f]{2})/gi;

/**
 * Resolves the encodings a browser undoes before it reads a URL: HTML
 * character references and percent escapes, plus `&colon;`. Named references
 * for plain letters do not exist, so decoding numeric references is enough to
 * expose a scheme spelled out as `&#106;avascript:`.
 *
 * Only ever used to *inspect* a URL; the value that gets rendered is untouched.
 */
function decodeForInspection(url: string): string {
  const point = (code: number) =>
    code === 0 || code > 0x10ffff ? "\uFFFD" : String.fromCodePoint(code);

  return url
    .replace(CHARACTER_REFERENCE, (_, hex, dec) =>
      point(parseInt(hex ?? dec, hex ? 16 : 10)),
    )
    .replace(PERCENT_ESCAPE, (_, hex) => point(parseInt(hex, 16)))
    .replace(/&colon;/gi, ":");
}

/**
 * Allowlists by URL *shape* instead of by name: whatever a browser would read
 * as the scheme is the text before the first `/`, `?` or `#`, and it has to be
 * one of `SAFE_SCHEMES`. That rejects `javascript:` along with every disguise
 * (`&#106;avascript:`, `java&#9;script:`, `javascript%3A`) while still
 * accepting genuine relative URLs, which cannot carry a colon in their first
 * segment.
 *
 * Returns `null` when the URL is unusable and the caller should emit the label
 * as plain text instead.
 */
function safeUrl(url: string | undefined): string | null {
  const value = (url ?? "").trim();
  if (value === "") return null;

  const head = decodeForInspection(value)
    .split(/[/?#]/, 1)[0]
    // Whitespace and control characters are legal inside a URL and are ignored
    // by browsers, so `java\tscript:` reaches the scheme parser as `javascript:`.
    .replace(/[\u0000-\u0020]/g, "")
    .toLowerCase();

  const colon = head.indexOf(":");
  if (colon === -1) return value;

  return SAFE_SCHEMES.has(head.slice(0, colon + 1)) ? value : null;
}

/**
 * Renders trusted-author markdown to HTML that is safe to inject with
 * `{@html}`.
 *
 * Safety is structural rather than a post-pass: `marked` escapes text itself,
 * and the two ways markdown can smuggle live markup — raw HTML tags and link
 * targets — are both neutralised here. That keeps the whole renderer free of a
 * DOM, so it runs identically on Workers and on Node.
 */
const marked = new Marked({
  gfm: true,
  breaks: false,
  renderer: {
    /** Raw HTML never renders: comments vanish, other tags show as typed. */
    html({ text }) {
      return text.trimStart().startsWith("<!--") ? "" : escapeHtml(text);
    },
    link({ href, title, tokens }) {
      const url = safeUrl(href);
      if (url === null) return this.parser.parseInline(tokens);

      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
      return `<a href="${escapeHtml(url)}"${titleAttr}>${this.parser.parseInline(tokens)}</a>`;
    },
    image({ href, title, text }) {
      const url = safeUrl(href);
      if (url === null) return escapeHtml(text);

      const titleAttr = title ? ` title="${escapeHtml(title)}"` : "";
      return `<img src="${escapeHtml(url)}" alt="${escapeHtml(text)}"${titleAttr}>`;
    },
  },
});

export async function renderMarkdown(markdown: string): Promise<string> {
  return marked.parse(markdown) as string;
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