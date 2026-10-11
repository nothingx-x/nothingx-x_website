import { readFile } from "node:fs/promises";
import { enhancedImages } from "@sveltejs/enhanced-img";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig, type Plugin } from "vite";
import wasm from "vite-plugin-wasm";

/**
 * Prisma's cloudflare runtime imports its query compiler as
 * `import("./query_compiler_fast_bg.wasm?module")` and expects the default
 * export to be a `WebAssembly.Module`. `vite-plugin-wasm` leaves the
 * `?module` query unhandled, so the raw bytes reach Rollup as JS and fail to
 * parse. Inline it as base64 and compile at module scope instead.
 */
function prismaQueryCompilerWasm(): Plugin {
  return {
    name: "prisma-query-compiler-wasm",
    enforce: "pre",
    async load(id) {
      const [file] = id.split("?");
      if (!file.endsWith("query_compiler_fast_bg.wasm")) return;

      const wasm = (await readFile(file)).toString("base64");

      return `
        const bytes = Uint8Array.from(atob(${JSON.stringify(wasm)}), (c) => c.charCodeAt(0));
        export default new WebAssembly.Module(bytes);
      `;
    },
  };
}

export default defineConfig({
  plugins: [prismaQueryCompilerWasm(), wasm(), sveltekit(), enhancedImages()],
});