import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "media", "architak-in");
const IMAGE_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".svg"]);

const files = fs
  .readdirSync(OUT_DIR)
  .filter((f) => IMAGE_EXTS.has(path.extname(f).toLowerCase()))
  .sort();

const images = files.map((file) => {
  const stat = fs.statSync(path.join(OUT_DIR, file));
  return {
    file,
    localPath: `/media/architak-in/${file}`,
    bytes: stat.size,
    source: "local-mirror",
  };
});

const out = path.join(ROOT, "content", "static", "images.json");
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, JSON.stringify(images, null, 2));
console.log(`Wrote ${images.length} images to ${out}`);
