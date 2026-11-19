import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { build } from "esbuild";

const source = await readFile("node_modules/yoga-layout/dist/binaries/yoga-wasm-base64-esm.js", "utf8");
const match = source.match(/data:application\/octet-stream;base64,([A-Za-z0-9+/=\s]+)"/);
if (!match) throw new Error("The locked Yoga package has no recognizable WASM payload");
const bytes = Buffer.from(match[1].replace(/\s/g, ""), "base64");
if (!bytes.subarray(0, 4).equals(Buffer.from([0, 97, 115, 109]))) {
  throw new Error("Yoga payload is not a WASM module");
}
await writeFile("worker/yoga.wasm", bytes);
console.log(`Prepared the original Yoga WASM module (${bytes.length} bytes)`);

await build({
  entryPoints: ["@react-pdf/renderer"],
  outfile: "worker/react-pdf.cjs",
  bundle: true,
  format: "cjs",
  platform: "node",
  conditions: [],
  minify: true,
  alias: { "yoga-layout/load": path.resolve("worker/yoga-loader.ts") },
  define: { "process.env.NODE_ENV": '"production"' },
});
console.log("Prepared the PDF renderer with its regular React runtime and static Yoga loader");
