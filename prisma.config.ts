// Prisma CLI configuration.
//
// The CLI reads DATABASE_URL from the process environment. npm scripts wrap
// each command in `node node_modules/dotenv-cli/cli.js -e .dev.vars` so the
// value comes from .dev.vars (the Cloudflare Workers format) rather than .env.
//
// Note: do not import "dotenv/config" here. It reads .env and would override
// the injected .dev.vars values.
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});