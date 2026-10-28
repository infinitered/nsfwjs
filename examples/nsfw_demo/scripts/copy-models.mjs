// Copies the raw model files (model.json + binary weight shards) from the repo
// root into public/models so the worker can load them by URL instead of
// bundling the base64-encoded `.min.js` versions.
import { cpSync, rmSync } from "fs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const source = resolve(root, "../../models");
const target = resolve(root, "public/models");

rmSync(target, { recursive: true, force: true });
cpSync(source, target, {
  recursive: true,
  filter: (src) => !src.endsWith(".js"),
});
