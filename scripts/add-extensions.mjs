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

      // Add .js extension to static imports (from './path')
      content = content.replace(/(from\s+['"]\.\/[^'"]+)/g, (match) => {
        if (!match.endsWith(extension)) {
          return `${match}${extension}`;
        }
        return match;
      });

      // Add .js extension to dynamic imports (import('./path'))
      content = content.replace(/(import\(['"]\.\/[^'"]+)/g, (match) => {
        if (!match.endsWith(extension)) {
          return `${match}${extension}`;
        }
        return match;
      });

      writeFileSync(fullPath, content);
    }
  });
}

// Call the function on the target directory
addExtensions(directory);
