import assert from "node:assert/strict";
import { excerpt, renderMarkdown } from "../src/lib/markdown.server.ts";

let passed = 0;
const check = (name: string, fn: () => void | Promise<void>) =>
  (async () => {
    await fn();
    passed++;
    console.log(`  ok  ${name}`);
  })().catch((e) => {
    console.error(`FAIL  ${name}: ${e.message}`);
    process.exit(1);
  });

const render = (markdown: string) => renderMarkdown(markdown);

await check("renders ordinary gfm unchanged", async () => {
  const html = await render(
    "# Title\n\nSome **bold** and `code`.\n\n| a | b |\n| - | - |\n| 1 | 2 |\n",
  );
  assert.ok(html.includes("<h1>Title</h1>"), html);
  assert.ok(html.includes("<strong>bold</strong>"), html);
  assert.ok(html.includes("<code>code</code>"), html);
  assert.ok(html.includes("<table>"), html);
});

await check("escapes raw html instead of rendering it", async () => {
  const html = await render("<script>alert(1)</script>\n");
  assert.ok(!html.includes("<script"), html);
  assert.ok(html.includes("&lt;script&gt;"), html);
});

await check("neutralises html injection vectors", async () => {
  const html = await render('<img src=x onerror=alert(1)>\n\n<iframe src="//evil"></iframe>\n');
  // The only markup here came from the markdown source, so no live tag may
  // survive at all — the payloads must survive only as escaped text.
  assert.ok(!/<[a-z]/i.test(html), html);
  assert.ok(html.includes("&lt;img src=x onerror=alert(1)&gt;"), html);
  assert.ok(html.includes("&lt;iframe"), html);
});

await check("drops html comments silently", async () => {
  const html = await render("before\n\n<!-- hidden -->\n\nafter\n");
  assert.ok(!html.includes("hidden"), html);
  assert.ok(!html.includes("<!--"), html);
});

await check("keeps safe link targets", async () => {
  const html = await render(
    "[a](https://example.com/x?y=1&z=2 'T') [b](/blog/post) [c](#anchor) [d](mailto:a@b.co)",
  );
  assert.ok(html.includes('href="https://example.com/x?y=1&amp;z=2"'), html);
  assert.ok(html.includes('title="T"'), html);
  assert.ok(html.includes('href="/blog/post"'), html);
  assert.ok(html.includes('href="#anchor"'), html);
  assert.ok(html.includes('href="mailto:a@b.co"'), html);
});

await check("drops javascript: link targets but keeps the label", async () => {
  const html = await render("[click](javascript:alert(1))");
  assert.ok(!html.includes("javascript"), html);
  assert.ok(!html.includes("<a "), html);
  assert.ok(html.includes("click"), html);
});

await check("drops disguised javascript: targets", async () => {
  for (const href of [
    "JaVaScRiPt:alert(1)",
    "java\tscript:alert(1)",
    "javascript&#58;alert(1)",
    "&#106;avascript:alert(1)",
    " javascript:alert(1)",
    "data:text/html;base64,PHNjcmlwdD4=",
    "vbscript:msgbox(1)",
  ]) {
    const html = await render(`[x](${href.replace(/ /g, "%20")})`);
    assert.ok(!/<a /i.test(html), `${href} => ${html}`);
  }
});

await check("drops javascript: image sources", async () => {
  const html = await render("![alt](javascript:alert(1))");
  assert.ok(!html.includes("javascript"), html);
  assert.ok(!/<img/i.test(html), html);
  assert.ok(html.includes("alt"), html);
});

await check("keeps safe image sources", async () => {
  const html = await render("![alt](/img/a.webp)");
  assert.ok(html.includes('<img src="/img/a.webp" alt="alt">'), html);
});

await check("autolinks only survive with a safe scheme", async () => {
  const safe = await render("<https://example.com>");
  assert.ok(safe.includes('href="https://example.com"'), safe);

  const unsafe = await render("<javascript:alert(1)>");
  assert.ok(!/<a /i.test(unsafe), unsafe);
});

await check("escapes text that could break out of an attribute", async () => {
  const html = await render('![a"onerror="alert(1)](/x.png)');
  assert.ok(!html.includes('onerror="alert'), html);
});

await check("excerpt strips markup", () => {
  assert.equal(excerpt("# Hi\n\n`code` and [a link](/x)"), "Hi code and a link");
  assert.equal(excerpt("```js\nignored\n```\nkept"), "kept");
  assert.equal(excerpt("![alt](/a.png) caption"), "caption");
  assert.equal(excerpt("a".repeat(200), 10).length, 11);
});

console.log(`${passed} passed`);