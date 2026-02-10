import { readFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const MANIFEST_PATH = path.join(ROOT, "data", "transcript_manifest.json");

function stripHtml(html) {
  // Remove script/style
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ");

  // Remove tags
  text = text.replace(/<[^>]+>/g, " ");

  // Decode common entities
  text = text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Normalize whitespace
  text = text.replace(/\s+/g, " ").trim();
  return text;
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "EarningsVerifier/1.0 (educational-project@example.com)"
    }
  });
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status} ${res.statusText}`);
  }

  const contentType = res.headers.get("content-type") || "";
  const body = await res.text();

  if (contentType.includes("text/html")) return stripHtml(body);
  return body;
}

async function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

async function main() {
  const raw = await readFile(MANIFEST_PATH, "utf-8");
  const manifest = JSON.parse(raw);

  const calls = manifest.calls || [];
  let fetched = 0;
  let skipped = 0;
  let failed = 0;

  for (const call of calls) {
    const url = (call.transcript_url || "").trim();
    const outPath = call.transcript_output_path;

    if (!url) {
      skipped++;
      continue;
    }

    try {
      const text = await fetchText(url);
      await ensureDir(path.join(ROOT, outPath));
      await writeFile(path.join(ROOT, outPath), text, "utf-8");
      fetched++;
      process.stdout.write(`Fetched ${call.ticker} ${call.quarter} -> ${outPath}\n`);
    } catch (err) {
      failed++;
      process.stderr.write(`Failed ${call.ticker} ${call.quarter} (${url}): ${err.message}\n`);
    }
  }

  process.stdout.write(`\nDone. fetched=${fetched} skipped=${skipped} failed=${failed}\n`);
  process.stdout.write("Next: use Claude Skill to extract claims JSON into claims_output_path files.\n");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
