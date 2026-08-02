import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { dirname, normalize, posix } from "path";

// Source maps must ship in the npm package and stay usable.
// 1. Every sourceMappingURL comment in a packed .js file must resolve to a
//    packed .map file. A dangling reference breaks DevTools for consumers.
// 2. Every source map referenced by a packed JavaScript file must parse as
//    JSON, list sources, and either embed the source text or point at a
//    source file that is also packed.

const npmBin = process.platform === "win32" ? "npm.cmd" : "npm";

const getPackedFiles = () => {
  const stdout = execFileSync(
    npmBin,
    ["pack", "--dry-run", "--json", "--ignore-scripts"],
    { encoding: "utf8" }
  );
  const report = JSON.parse(stdout);
  return report
    .flatMap((entry) => (entry.files ? entry.files : [entry]))
    .map((file) => normalize(file.path).replace(/\\/g, "/"));
};

const sourceMappingUrlPattern = /\/\/# sourceMappingURL=(\S+)/g;

const isRemoteSource = (source) =>
  source.startsWith("http://") ||
  source.startsWith("https://") ||
  source.startsWith("data:");

const checkSourceMaps = (packedFiles) => {
  const problems = [];

  packedFiles.forEach((file) => {
    if (!file.endsWith(".js")) {
      return;
    }

    const content = readFileSync(file, "utf8");
    const fileDir = dirname(file);

    for (const match of content.matchAll(sourceMappingUrlPattern)) {
      const mapPath = normalize(posix.join(fileDir, match[1])).replace(
        /\\/g,
        "/"
      );

      if (!packedFiles.includes(mapPath)) {
        problems.push(`missing packed map file: ${file} -> ${mapPath}`);
        continue;
      }

      let map;
      try {
        map = JSON.parse(readFileSync(mapPath, "utf8"));
      } catch (error) {
        problems.push(`unparseable map: ${mapPath} (${error.message})`);
        continue;
      }

      const sources = Array.isArray(map.sources) ? map.sources : [];
      if (sources.length === 0) {
        problems.push(`map without sources: ${mapPath}`);
      }

      const sourcesContent = map.sourcesContent;

      sources.forEach((source, index) => {
        if (isRemoteSource(source)) {
          return;
        }

        const sourcePath = normalize(
          posix.join(dirname(mapPath), source)
        ).replace(/\\/g, "/");

        if (packedFiles.includes(sourcePath)) {
          return;
        }

        const hasEmbeddedSource =
          Array.isArray(sourcesContent) &&
          sourcesContent[index] != null &&
          sourcesContent[index].trim() !== "";

        if (!hasEmbeddedSource) {
          problems.push(
            `source not packed and no sourcesContent: ${mapPath} -> ${source}`
          );
        }
      });
    }
  });

  return problems;
};

const packedFiles = getPackedFiles();
const problems = checkSourceMaps(packedFiles);

if (problems.length > 0) {
  console.error(
    `Source map problems found in npm package:\n` +
      problems.map((problem) => `  ${problem}`).join("\n")
  );
  process.exit(1);
}

console.log(
  `OK: ${packedFiles.length} files packed, all source maps resolve and stay usable.`
);
