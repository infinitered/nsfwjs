import { exec } from "child_process";
import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  unlinkSync,
  writeFileSync,
} from "fs";

// The first argument is the model name, the second argument is the number of shards
const model = process.argv[2];
const numShards = +process.argv[3];
const filenames = ["model"];

for (let i = 1; i <= numShards; i++) {
  filenames.push(`group1-shard${i}of${numShards}`);
}

const binToJson = (sourcePath, outputPath) => {
  // Read the binary file and convert it to Base64
  const binFile = readFileSync(`${sourcePath}`);
  const base64String = binFile.toString("base64");

  // Write the Base64 string to a .json file
  writeFileSync(`${outputPath}.json`, JSON.stringify(base64String));
};

filenames.forEach((filename) => {
  const sourcePath = `./models/${model}/${filename}`;
  const outputDir = `./dist/models/${model}`;
  const outputPath = `${outputDir}/${filename}`;

  // Create the output directory if it doesn't exist
  mkdirSync(outputDir, { recursive: true });

  if (filename === "model") {
    // Copy the model.json file
    copyFileSync(`${sourcePath}.json`, `${outputPath}.json`);
  } else {
    binToJson(sourcePath, outputPath);
  }

  // Step 1: Generate UMD version with Browserify
  const identifier = filename.replace(/-/g, "_");
  exec(
    `browserify ${outputPath}.json -s ${identifier} -o ${outputPath}.js`,
    (error, stdout, stderr) => {
      if (error) {
        console.log(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);

      // Minify the .js file with Terser
      exec(
        `terser ${outputPath}.js -c -m -o ${outputPath}.min.js`,
        (error, stdout, stderr) => {
          if (error) {
            console.log(`Error: ${error.message}`);
            return;
          }
          if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
          }
          console.log(`stdout: ${stdout}`);

          // Delete the original .js and .json files
          unlinkSync(`${outputPath}.js`);
          unlinkSync(`${outputPath}.json`);
        }
      );
    }
  );

  // Step 2: Generate ESM version using esbuild
  exec(
    `esbuild ${outputPath}.json --bundle --format=esm --minify --outfile=${outputPath}.esm.min.js --log-level=error`,
    (error, stdout, stderr) => {
      if (error) {
        console.log(`Error: ${error.message}`);
        return;
      }
      if (stderr) {
        console.log(`stderr: ${stderr}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
    }
  );
});
