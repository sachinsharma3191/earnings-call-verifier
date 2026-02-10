import { readFile, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();

function parseArgs(argv) {
  const args = { baseUrl: "http://localhost:3001" };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--baseUrl" && argv[i + 1]) {
      args.baseUrl = argv[i + 1];
      i++;
    }
  }
  return args;
}

async function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  if (!existsSync(dir)) {
    await mkdir(dir, { recursive: true });
  }
}

async function verifyOne({ baseUrl, ticker, quarter, claimsPath }) {
  const raw = await readFile(claimsPath, "utf-8");
  const claimsJson = JSON.parse(raw);

  // Allow file to be either {claims:[...]} or [...]
  const claims = Array.isArray(claimsJson) ? claimsJson : (claimsJson.claims ?? []);

  const res = await fetch(`${baseUrl}/api/verification/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ticker, quarter, claims })
  });

  const data = await res.json();
  if (!res.ok) {
    const msg = data?.error ? String(data.error) : `HTTP ${res.status}`;
    throw new Error(msg);
  }

  return data;
}

async function main() {
  const args = parseArgs(process.argv);

  const manifestPath = path.join(ROOT, "data", "transcript_manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf-8"));

  const calls = manifest.calls || [];

  const results = [];
  let ok = 0;
  let skipped = 0;
  let failed = 0;

  for (const call of calls) {
    const ticker = call.ticker;
    const quarter = call.quarter;
    const claimsOut = path.join(ROOT, call.claims_output_path);

    if (!existsSync(claimsOut)) {
      skipped++;
      continue;
    }

    try {
      const verified = await verifyOne({
        baseUrl: args.baseUrl,
        ticker,
        quarter,
        claimsPath: claimsOut
      });

      const outPath = path.join(ROOT, "results", ticker, `${quarter.replace(/\s+/g, "_")}.verified.json`);
      await ensureDir(outPath);
      await writeFile(outPath, JSON.stringify(verified, null, 2), "utf-8");

      results.push({ ticker, quarter, output: path.relative(ROOT, outPath), summary: verified.summary });
      ok++;
      process.stdout.write(`Verified ${ticker} ${quarter} -> ${path.relative(ROOT, outPath)}\n`);
    } catch (err) {
      failed++;
      process.stderr.write(`Failed verify ${ticker} ${quarter}: ${err.message}\n`);
    }
  }

  const indexPath = path.join(ROOT, "results", "index.json");
  await ensureDir(indexPath);
  await writeFile(indexPath, JSON.stringify({
    baseUrl: args.baseUrl,
    generated_at: new Date().toISOString(),
    ok,
    skipped,
    failed,
    results
  }, null, 2), "utf-8");

  process.stdout.write(`\nDone. ok=${ok} skipped=${skipped} failed=${failed}\n`);
  process.stdout.write(`Wrote results index: ${path.relative(ROOT, indexPath)}\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
