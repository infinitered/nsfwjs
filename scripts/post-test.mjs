import { readdirSync, rmSync } from "fs";
import { join } from "path";

const dir = "./models";

const models = readdirSync(dir, { withFileTypes: true })
  .filter((dirent) => dirent.isDirectory())
  .map((dirent) => dirent.name);

models.forEach((model) => {
  const modelDir = join(dir, model);
  readdirSync(modelDir, { withFileTypes: true })
    .filter((dirent) => dirent.isFile() && dirent.name.endsWith(".min.js"))
    .forEach((dirent) => {
      rmSync(join(modelDir, dirent.name), { force: true });
    });
});
