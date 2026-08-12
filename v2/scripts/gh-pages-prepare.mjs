/**
 * Prepara / restaura la app para un export estático compatible con GitHub Pages.
 *
 * GitHub Pages no ejecuta Node: hay que excluir Route Handlers y middleware.
 * Uso:
 *   node scripts/gh-pages-prepare.mjs prepare
 *   node scripts/gh-pages-prepare.mjs restore
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const stash = path.join(root, ".gh-pages-stash");

const targets = [
  { from: path.join(root, "src", "middleware.ts"), name: "middleware.ts" },
  { from: path.join(root, "src", "app", "api"), name: "api" },
];

function rm(target) {
  if (fs.existsSync(target)) {
    fs.rmSync(target, { recursive: true, force: true, maxRetries: 5 });
  }
}

function ensureEmptyDir(dir) {
  rm(dir);
  fs.mkdirSync(dir, { recursive: true });
}

function moveAway(from, dest) {
  rm(dest);
  // copy + delete es más fiable que rename en Windows (OneDrive / locks)
  fs.cpSync(from, dest, { recursive: true });
  rm(from);
}

function prepare() {
  ensureEmptyDir(stash);
  for (const t of targets) {
    if (!fs.existsSync(t.from)) {
      console.log(`skip (missing): ${t.from}`);
      continue;
    }
    const dest = path.join(stash, t.name);
    moveAway(t.from, dest);
    console.log(`stashed: ${t.name}`);
  }
  const envPath = path.join(root, ".env.production.local");
  fs.writeFileSync(
    envPath,
    ["GITHUB_PAGES=1", "NEXT_PUBLIC_DEMO_STATIC=1", "NEXT_PUBLIC_SITE_URL=", ""].join(
      "\n",
    ),
    "utf8",
  );
  console.log("wrote .env.production.local");
}

function restore() {
  for (const t of targets) {
    const src = path.join(stash, t.name);
    if (!fs.existsSync(src)) continue;
    rm(t.from);
    fs.cpSync(src, t.from, { recursive: true });
    console.log(`restored: ${t.name}`);
  }
  const envPath = path.join(root, ".env.production.local");
  if (fs.existsSync(envPath)) fs.unlinkSync(envPath);
  rm(stash);
  console.log("restore done");
}

const cmd = process.argv[2];
if (cmd === "prepare") prepare();
else if (cmd === "restore") restore();
else {
  console.error("Usage: node scripts/gh-pages-prepare.mjs <prepare|restore>");
  process.exit(1);
}
