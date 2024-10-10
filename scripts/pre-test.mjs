import { copyFileSync, mkdirSync, readdirSync } from "fs";
import { join } from "path";

const srcDir = "./dist/cjs/models";
const destDir = "./src/models";

// Get the names of all subfolders in the srcDir
const models = readdirSync(srcDir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

models.forEach((model) => {
  const modelSrcDir = join(srcDir, model);
  const modelDestDir = join(destDir, model);

  mkdirSync(modelDestDir, { recursive: true });

  readdirSync(modelSrcDir, { withFileTypes: true })
    .filter((dirent) => dirent.isFile() && dirent.name.endsWith(".min.js"))
    .forEach((dirent) => {
      const srcFile = join(modelSrcDir, dirent.name);
      const destFile = join(modelDestDir, dirent.name);
      copyFileSync(srcFile, destFile);
    });
});
