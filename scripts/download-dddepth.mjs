/**
 * Downloads fffuel dddepth backgrounds into public/dddepth/3dshapes.
 * Usage: node scripts/download-dddepth.mjs
 */
import fs from "node:fs";
import path from "node:path";

const TOTAL = 354;
const CONCURRENCY = 8;
const dir = path.join(process.cwd(), "public", "dddepth", "3dshapes");
fs.mkdirSync(dir, { recursive: true });

let next = 1;
let done = 0;
let failed = 0;

async function one(n) {
  const name = `dddepth-${String(n).padStart(3, "0")}.jpg`;
  const dest = path.join(dir, name);
  if (fs.existsSync(dest) && fs.statSync(dest).size > 10_000) {
    done++;
    return;
  }
  const url = `https://www.fffuel.co/images/dddepth/${name}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
      done++;
      if (done % 20 === 0 || done === TOTAL) {
        console.log(`progress ${done}/${TOTAL} failed ${failed}`);
      }
      return;
    } catch (err) {
      if (attempt === 2) {
        failed++;
        console.error("fail", name, err.message);
      } else {
        await new Promise((r) => setTimeout(r, 500 * (attempt + 1)));
      }
    }
  }
}

async function worker() {
  while (true) {
    const n = next++;
    if (n > TOTAL) return;
    await one(n);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
console.log(`DONE done=${done} failed=${failed}`);
