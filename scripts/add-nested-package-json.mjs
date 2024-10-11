import { writeFileSync } from "fs";
import { join } from "path";

function addPackageJson(dir, type) {
  const packageJsonContent = JSON.stringify({ type }, null, 2);
  const filePath = join(dir, "package.json");
  writeFileSync(filePath, packageJsonContent);
  console.log(`Created package.json in ${dir}`);
}

// Add package.json for ESM and CJS builds
addPackageJson("./dist/esm", "module");
addPackageJson("./dist/cjs", "commonjs");
