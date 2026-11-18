import { readFile, writeFile } from "node:fs/promises";

const source = await readFile("node_modules/yoga-layout/dist/binaries/yoga-wasm-base64-esm.js", "utf8");
const match = source.match(/data:application\/octet-stream;base64,([A-Za-z0-9+/=\s]+)"/);
if (!match) throw new Error("The locked Yoga package has no recognizable WASM payload");
const bytes = Buffer.from(match[1].replace(/\s/g, ""), "base64");
if (!bytes.subarray(0, 4).equals(Buffer.from([0, 97, 115, 109]))) {
  throw new Error("Yoga payload is not a WASM module");
}
await writeFile("worker/yoga.wasm", bytes);
console.log(`Prepared the original Yoga WASM module (${bytes.length} bytes)`);
