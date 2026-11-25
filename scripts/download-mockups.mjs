import fs from "fs";
import path from "path";
import https from "https";
import http from "http";

const sources = [
  "lib/canvas/device-mockup.tsx",
  "components/canvas/use-element-library.ts",
];

const urlRe = /https:\/\/assets\.postspark\.app\/mockups\/[^"']+/g;
const urls = [
  ...new Set(
    sources.flatMap((file) => {
      const text = fs.readFileSync(file, "utf8");
      return [...text.matchAll(urlRe)].map((m) => m[0]);
    }),
  ),
];

console.log(`Downloading ${urls.length} mockups…`);

function fetchTo(url, dest) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith("https") ? https : http;
    const req = mod.get(
      url,
      { headers: { "User-Agent": "deckva-mockup-fetch/1.0" } },
      (res) => {
        if (
          res.statusCode >= 300 &&
          res.statusCode < 400 &&
          res.headers.location
        ) {
          res.resume();
          fetchTo(res.headers.location, dest).then(resolve, reject);
          return;
        }
        if (res.statusCode !== 200) {
          res.resume();
          reject(new Error(`${url} -> ${res.statusCode}`));
          return;
        }
        fs.mkdirSync(path.dirname(dest), { recursive: true });
        const out = fs.createWriteStream(dest);
        res.pipe(out);
        out.on("finish", () => out.close(() => resolve(dest)));
        out.on("error", reject);
      },
    );
    req.on("error", reject);
  });
}

let ok = 0;
let fail = 0;
for (const url of urls) {
  const rel = url.replace("https://assets.postspark.app/", "");
  const dest = path.join("public", rel);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 1000) {
    console.log(`skip ${rel}`);
    ok += 1;
    continue;
  }
  try {
    await fetchTo(url, dest);
    console.log(`ok   ${rel} (${fs.statSync(dest).size} bytes)`);
    ok += 1;
  } catch (err) {
    console.error(`fail ${rel}: ${err.message}`);
    fail += 1;
  }
}

console.log(JSON.stringify({ ok, fail, total: urls.length }));
if (fail > 0) process.exit(1);
