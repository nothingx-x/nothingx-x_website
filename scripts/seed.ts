/**
 * Creates or updates a user. Standalone (no SvelteKit module resolution) so it
 * can run under tsx directly.
 *
 *   npm run db:seed -- admin@example.com "password" "Admin"
 */
import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "../src/lib/crypto.ts";

const [email, password, name, role = "ADMIN"] = process.argv.slice(2);

if (!email || !password || !name) {
  console.error(
    'usage: npm run db:seed -- <email> <password> <name> [ADMIN|MEMBER]',
  );
  process.exit(1);
}

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const prisma = new PrismaClient({ adapter: new PrismaPg(url) });
const hashedPassword = await hashPassword(password);

const user = await prisma.user.upsert({
  where: { email: email.trim().toLowerCase() },
  update: { name, hashedPassword, role: role as "ADMIN" | "MEMBER" },
  create: {
    email: email.trim().toLowerCase(),
    name,
    hashedPassword,
    role: role as "ADMIN" | "MEMBER",
  },
  select: { id: true, email: true, name: true, role: true },
});

console.log(`seeded ${user.email} (${user.name}) as ${user.role}, id=${user.id}`);

await prisma.$disconnect();