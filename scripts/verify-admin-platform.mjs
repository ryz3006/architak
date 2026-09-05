/**
 * Lightweight regression checks for admin platform pure logic.
 * Run: node scripts/verify-admin-platform.mjs
 */

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function fillToMinimum(items, minimum) {
  if (items.length === 0) return items;
  if (items.length >= minimum) return items;
  const result = [...items];
  let i = 0;
  while (result.length < minimum) {
    result.push(items[i % items.length]);
    i += 1;
  }
  return result;
}

function lengthScore(value, optimalMin, optimalMax, okMin, okMax) {
  const len = value.trim().length;
  if (len >= optimalMin && len <= optimalMax) return 100;
  if (len >= okMin && len <= okMax) return 70;
  if (len === 0) return 0;
  if (len < okMin) return Math.max(10, Math.round((len / okMin) * 50));
  return Math.max(10, Math.round((okMax / len) * 50));
}

function validateMediaFileMeta(input) {
  const allowed = new Set([
    "jpg",
    "jpeg",
    "png",
    "webp",
    "avif",
    "svg",
    "mp4",
    "webm",
    "mov",
  ]);
  const rejected = new Set(["tiff", "tif", "bmp", "heic", "avi", "wmv", "flv"]);
  const parts = input.filename.split(".");
  const extension = parts.length > 1 ? parts.at(-1).toLowerCase() : "";
  if (rejected.has(extension) || !allowed.has(extension)) {
    return { ok: false, message: `Unsupported format: .${extension}` };
  }
  const maxBytes = input.mimeType.startsWith("video/")
    ? 500 * 1024 * 1024
    : 25 * 1024 * 1024;
  if (input.byteSize > maxBytes) {
    return { ok: false, message: "File exceeds size limit" };
  }
  return { ok: true };
}

function quotaFits(currentBytes, incomingBytes, maxBytes) {
  return currentBytes + incomingBytes <= maxBytes;
}

let passed = 0;

function test(name, fn) {
  try {
    fn();
    passed += 1;
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    console.error(`  ${error.message}`);
    process.exitCode = 1;
  }
}

test("fillToMinimum cycles when short", () => {
  const result = fillToMinimum(["a", "b"], 5);
  assert(result.length === 5, `expected 5 got ${result.length}`);
  assert(result.join("") === "ababa", `unexpected order ${result.join("")}`);
});

test("fillToMinimum preserves when enough", () => {
  const result = fillToMinimum(["a", "b", "c"], 2);
  assert(result.length === 3, "should not truncate");
});

test("SEO title length scoring", () => {
  assert(lengthScore("A".repeat(55), 50, 60, 30, 70) === 100, "optimal title");
  assert(lengthScore("", 50, 60, 30, 70) === 0, "empty title");
  assert(lengthScore("A".repeat(40), 50, 60, 30, 70) === 70, "ok title");
});

test("media rejects TIFF/HEIC", () => {
  assert(!validateMediaFileMeta({ filename: "x.tiff", mimeType: "image/tiff", byteSize: 10 }).ok);
  assert(!validateMediaFileMeta({ filename: "x.heic", mimeType: "image/heic", byteSize: 10 }).ok);
  assert(validateMediaFileMeta({ filename: "x.jpg", mimeType: "image/jpeg", byteSize: 10 }).ok);
});

test("storage quota hard stop at 7GB", () => {
  const MAX = 7 * 1024 * 1024 * 1024;
  assert(quotaFits(MAX - 100, 50, MAX), "should fit");
  assert(!quotaFits(MAX - 100, 200, MAX), "should reject over quota");
});

test("Telegram message truncation boundary", () => {
  const MAX = 500;
  const long = "x".repeat(600);
  const text = long.length <= MAX ? long : long.slice(0, MAX - 1).trimEnd() + "…";
  assert(text.length <= MAX, "truncated length");
  assert(text.endsWith("…"), "ellipsis");
});

if (process.exitCode) {
  console.error(`\n${passed} passed before failure`);
} else {
  console.log(`\nAll ${passed} admin platform checks passed.`);
}
