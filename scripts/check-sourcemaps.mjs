import { execFileSync } from "child_process";
import { readFileSync } from "fs";
import { dirname, join, normalize, posix } from "path";

// Source maps must ship in the npm package.
// Every sourceMappingURL comment in a packed .js file must resolve to a
// packed .map file. A dangling reference breaks the debugger experience for
// consumers, so the check fails the build when one appears.

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

const checkSourceMaps = (packedFiles) => {
  const danglingReferences = [];

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
        danglingReferences.push(`${file} -> ${mapPath}`);
      }
    }
  });

  return danglingReferences;
};

const packedFiles = getPackedFiles();
const danglingReferences = checkSourceMaps(packedFiles);

if (danglingReferences.length > 0) {
  console.error(
    `Dangling sourceMappingURL references found in npm package:\n` +
      danglingReferences.map((ref) => `  ${ref}`).join("\n")
  );
  process.exit(1);
}

console.log(
  `OK: ${packedFiles.length} files packed, all sourceMappingURL references resolve.`
);
