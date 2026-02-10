import { cp, rm, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const serverDir = path.join(root, "server");
const apiDir = path.join(root, "api");

async function main() {
  if (!existsSync(serverDir)) {
    throw new Error("Expected ./server to exist (source of Vercel functions)");
  }

  if (existsSync(apiDir)) {
    await rm(apiDir, { recursive: true, force: true });
  }

  await mkdir(apiDir, { recursive: true });
  await cp(serverDir, apiDir, { recursive: true });

  // Vercel expects functions in /api at build time.
  // We keep source-of-truth in /server and generate /api on demand.
  process.stdout.write("Synced server/ -> api/\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
