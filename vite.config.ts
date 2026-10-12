import { readFile } from "node:fs/promises";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, type Plugin } from "vite";
import { unwasm } from "unwasm/plugin";

/**
 * Prisma's cloudflare runtime loads its query compiler via
 * `import("./query_compiler_fast_bg.wasm?module")` and expects the default
 * export to be a `WebAssembly.Module`.
 *
 * Build and dev need different loading strategies, because they run in
 * different places and enforce different rules:
 *
 *   Build uses `unwasm({ esmImport: true })`, which rewrites that import to a
 *   plain ESM import of the `.wasm` file so wrangler bundles it natively.
 *   This is mandatory for production: workerd refuses to compile WebAssembly
 *   from bytes at runtime ("Wasm code generation disallowed by embedder") and
 *   exposes no compatibility flag to allow it.
 *
 *   Dev uses `prismaWasmDev()`, which inlines the binary as base64. Vite's dev
 *   server rejects native `.wasm` ESM imports ("ESM integration proposal for
 *   Wasm is not supported"), and `vite dev` runs the SSR module in Node, where
 *   compiling WebAssembly from bytes is permitted.
 *
 * `unwasm` is therefore excluded from dev; left enabled there it marks the
 * module external and yields a `\x00unwasm:external:` id that no loader can
 * resolve from disk.
 *
 * Both require `runtime = "cloudflare"` in the Prisma generator block.
 * Upstream: https://github.com/prisma/orm/issues/28657
 */
function prismaWasmDev(): Plugin {
  return {
    name: "prisma-wasm-dev",
    apply: "serve",
    async load(id) {
      const [file] = id.split("?");
      if (!file.endsWith(".wasm")) return;

      const bytes = (await readFile(file)).toString("base64");

      return `
        const bytes = Uint8Array.from(atob(${JSON.stringify(bytes)}), (c) => c.charCodeAt(0));
        export default new WebAssembly.Module(bytes);
      `;
    },
  };
}

export default defineConfig(({ command }) => ({
  plugins: [
    prismaWasmDev(),
    ...(command === "build" ? [unwasm({ esmImport: true })] : []),
    sveltekit(),
    enhancedImages(),
  ],
}));