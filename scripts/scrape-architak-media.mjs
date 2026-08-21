import fs from "node:fs";
import path from "node:path";
import https from "node:https";
import http from "node:http";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");
const MEDIA_DIR = path.join(ROOT, "content", "media");
const OUT_DIR = path.join(ROOT, "public", "media", "architak-in");
const MANIFEST_PATH = path.join(MEDIA_DIR, "image-manifest.json");

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    lib
      .get(url, { headers: { "User-Agent": "ArchitakStaticMirror/1.0" } }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchJson(res.headers.location).then(resolve, reject);
          return;
        }
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", reject);
  });
}

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const lib = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(dest);
    lib
      .get(url, { headers: { "User-Agent": "ArchitakStaticMirror/1.0" } }, (res) => {
        if (res.statusCode && res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          file.close();
          fs.unlinkSync(dest);
          downloadFile(res.headers.location, dest).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest);
          reject(new Error(`HTTP ${res.statusCode} for ${url}`));
          return;
        }
        res.pipe(file);
        file.on("finish", () => file.close(() => resolve(dest)));
      })
      .on("error", (err) => {
        file.close();
        if (fs.existsSync(dest)) fs.unlinkSync(dest);
        reject(err);
      });
  });
}

const IMAGE_EXT = /\.(jpe?g|png|webp|gif|avif|svg)(\?.*)?$/i;

function extractUrlsFromHtml(html) {
  const re = /https?:\/\/architak\.in\/wp-content\/uploads\/[^"'\\\s>]+/gi;
  return [...new Set(html.match(re) || [])]
    .map((u) => u.replace(/&amp;/g, "&"))
    .filter((u) => IMAGE_EXT.test(u));
}

function slugFromUrl(url) {
  const u = new URL(url);
  return u.pathname.replace(/^\/wp-content\/uploads\//, "").replace(/\//g, "__");
}

async function collectFromApi() {
  const items = [];
  for (let page = 1; page <= 10; page += 1) {
    const url = `https://architak.in/wp-json/wp/v2/media?per_page=100&page=${page}`;
    let data;
    try {
      data = await fetchJson(url);
    } catch {
      break;
    }
    if (!Array.isArray(data) || data.length === 0) break;
    for (const m of data) {
      const src = m.source_url || m.guid?.rendered;
      const mime = m.mime_type || "";
      if (!src || !mime.startsWith("image/")) continue;
      items.push({
        id: m.id,
        src,
        title: (m.title?.rendered || "media").replace(/<[^>]+>/g, "").trim(),
        alt: (m.alt_text || "").trim(),
        mime,
        width: m.media_details?.width ?? null,
        height: m.media_details?.height ?? null,
        source: "wp-media-api",
      });
    }
    if (data.length < 100) break;
  }
  return items;
}

function collectFromSavedHtml() {
  const files = ["homepage.html", "projects.html", "about.html", "services.html"];
  const urls = new Set();
  for (const f of files) {
    const p = path.join(MEDIA_DIR, f);
    if (!fs.existsSync(p)) continue;
    for (const u of extractUrlsFromHtml(fs.readFileSync(p, "utf8"))) urls.add(u);
  }
  return [...urls].map((src) => ({
    id: null,
    src,
    title: path.basename(src),
    alt: "",
    mime: "image/*",
    width: null,
    height: null,
    source: "html",
  }));
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(MEDIA_DIR, { recursive: true });

  const fromApi = await collectFromApi();
  const fromHtml = collectFromSavedHtml();

  const bySrc = new Map();
  for (const item of [...fromApi, ...fromHtml]) {
    if (!bySrc.has(item.src)) bySrc.set(item.src, item);
  }
  const all = [...bySrc.values()];
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(all, null, 2));
  console.log(`Manifest: ${all.length} unique images`);

  const local = [];
  let ok = 0;
  let fail = 0;

  for (const item of all) {
    const filename = slugFromUrl(item.src);
    const dest = path.join(OUT_DIR, filename);
    const publicPath = `/media/architak-in/${filename}`;

    try {
      if (!fs.existsSync(dest) || fs.statSync(dest).size === 0) {
        process.stdout.write(`Downloading ${filename}...\n`);
        await downloadFile(item.src, dest);
      }
      local.push({
        ...item,
        localPath: publicPath,
        file: filename,
        bytes: fs.statSync(dest).size,
      });
      ok += 1;
    } catch (e) {
      fail += 1;
      console.error(`FAIL ${item.src}: ${e.message}`);
    }
  }

  const localManifest = path.join(ROOT, "content", "static", "images.json");
  fs.mkdirSync(path.dirname(localManifest), { recursive: true });
  fs.writeFileSync(localManifest, JSON.stringify(local, null, 2));
  console.log(`Done. ok=${ok} fail=${fail} -> ${localManifest}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
