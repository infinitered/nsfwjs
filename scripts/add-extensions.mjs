import { readdirSync, readFileSync, statSync, writeFileSync } from "fs";
import { join } from "path";

const directory = "./dist/esm"; // Target directory
const extension = ".js";

function addExtensions(dir) {
  const files = readdirSync(dir);

  files.forEach((file) => {
    const fullPath = join(dir, file);

    if (statSync(fullPath).isDirectory()) {
      addExtensions(fullPath);
    } else if (fullPath.endsWith(".js")) {
      let content = readFileSync(fullPath, "utf8");

      // Add .js extension to relative static imports (./ and ../)
      content = content.replace(
        /(from\s+['"])(\.{1,2}\/[^'"]+)(['"])/g,
        (match, prefix, importPath, suffix) => {
          if (!importPath.endsWith(extension)) {
            return `${prefix}${importPath}${extension}${suffix}`;
          }
          return match;
        },
      );

      // Add .js extension to relative dynamic imports (./ and ../)
      content = content.replace(
        /(import\(['"])(\.{1,2}\/[^'"]+)(['"]\))/g,
        (match, prefix, importPath, suffix) => {
          if (!importPath.endsWith(extension)) {
            return `${prefix}${importPath}${extension}${suffix}`;
          }
          return match;
        },
      );

      writeFileSync(fullPath, content);
    }
  });
}

// Call the function on the target directory
addExtensions(directory);
