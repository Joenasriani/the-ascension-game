import { readFileSync, readdirSync, statSync } from "node:fs";
import assert from "node:assert/strict";
const html = readFileSync("dist/index.html", "utf8");
assert.match(html, /<script[^>]+type="module"[^>]+src=/);
const files = readdirSync("dist/assets");
assert(files.some((f) => f.endsWith(".js")));
assert(statSync("dist/music/thelittlehero.mp3").size > 100000);
for (const f of files.filter((f) => f.endsWith(".js"))) {
  const js = readFileSync(`dist/assets/${f}`, "utf8");
  assert(
    !/generativelanguage\.googleapis|GEMINI_API_KEY|AIza[\w-]{30}/.test(js),
    "Credential or Gemini client found in bundle",
  );
}
assert(!/https:\/\/cdn.tailwindcss/.test(html));
console.log("Production entry, audio and credential checks passed.");
