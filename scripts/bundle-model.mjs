import { exec } from "child_process";
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "fs";
import { promisify } from "util";

const execPromise = promisify(exec);
const model = process.argv[2];
const numShards = +process.argv[3];
const filenames = [
  "model",
  ...Array.from(
    { length: numShards },
    (_, i) => `group1-shard${i + 1}of${numShards}`
  ),
];

const BASE_MODEL_PATH = "./models/";
const BASE_DIST_PATH = "./dist/";
const JSON_EXT = ".json";
const MIN_JS_EXT = ".min.js";

const binToJson = (sourcePath, outputPath) => {
  const binFile = readFileSync(`${sourcePath}`);
  const base64String = binFile.toString("base64");
  writeFileSync(`${outputPath}.json`, JSON.stringify(base64String));
};

const runCommand = async (command) => {
  try {
    const { stdout, stderr } = await execPromise(command);
    if (stderr) console.error(`stderr: ${stderr}`);
    if (stdout) console.log(`stdout: ${stdout}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

const generateUmd = async (outputPath, filename) => {
  const identifier = filename.replace(/-/g, "_");
  await runCommand(
    `browserify ${outputPath}.json -s ${identifier} -o ${outputPath}.js`
  );
  await runCommand(
    `terser ${outputPath}.js -c -m -o ${outputPath}${MIN_JS_EXT}`
  );
  unlinkSync(`${outputPath}.js`);
  unlinkSync(`${outputPath}.json`);
};

const processBundle = async (filename) => {
  const sourcePath = `${BASE_MODEL_PATH}${model}/${filename}`;
  const outputDir = `${BASE_DIST_PATH}models/${model}`;
  const outputPath = `${outputDir}/${filename}`;

  mkdirSync(outputDir, { recursive: true });

  if (filename === "model") {
    copyFileSync(`${sourcePath}${JSON_EXT}`, `${outputPath}${JSON_EXT}`);
  } else {
    binToJson(sourcePath, outputPath);
  }

  await generateUmd(outputPath, filename);
};

const bundleAll = async () => {
  await Promise.all(
    filenames.map(async (filename) => {
      await processBundle(filename);
    })
  );
};

bundleAll().catch((err) => console.error(err));
