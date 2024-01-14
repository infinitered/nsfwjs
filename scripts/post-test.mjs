import { readdirSync, unlinkSync } from "fs";
import { join } from "path";

const dir = "./models";

// Get the names of all subfolders in the dir
const models = readdirSync(dir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

models.forEach((model) => {
  const modelDir = join(dir, model);

  readdirSync(modelDir, { withFileTypes: true })
    .filter((dirent) => dirent.isFile() && dirent.name.endsWith(".min.js"))
    .forEach((dirent) => {
      const file = join(modelDir, dirent.name);
      unlinkSync(file);
    });
});
