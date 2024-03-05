import * as tf from "@tensorflow/tfjs";
import { exec } from "child_process";
import fs from "fs";
import jpeg from "jpeg-js";
import { load } from "../src/index";

// Fix for JEST
const timeoutMS = 10000;
const NUMBER_OF_CHANNELS = 3;

const readImage = (path: string) => {
  const buf = fs.readFileSync(path);
  const pixels = jpeg.decode(buf, { useTArray: true });
  return pixels;
};

const imageByteArray = (
  image: ReturnType<typeof readImage>,
  numChannels: number
) => {
  const pixels = image.data;
  const numPixels = image.width * image.height;
  const values = new Int32Array(numPixels * numChannels);

  for (let i = 0; i < numPixels; i++) {
    for (let channel = 0; channel < numChannels; ++channel) {
      values[i * numChannels + channel] = pixels[i * 4 + channel];
    }
  }

  return values;
};

const imageToInput = (
  image: ReturnType<typeof readImage>,
  numChannels: number
) => {
  const values = imageByteArray(image, numChannels);
  const outShape = [image.height, image.width, numChannels] as [
    number,
    number,
    number
  ];
  const input = tf.tensor3d(values, outShape, "int32");

  return input;
};

it(
  "Snapshots",
  async () => {
    const model = await load();
    const logo = readImage(`${__dirname}/../_art/nsfwjs_logo.jpg`);
    const input = imageToInput(logo, NUMBER_OF_CHANNELS);
    const predictions = await model.classify(input);
    expect(predictions).toMatchSnapshot();
  },
  timeoutMS
);

it(
  "Builds, bundles and minifies",
  (done) => {
    const cmd = "yarn bundle";
    exec(cmd, (err) => {
      if (err) done.fail("Failed to build, bundle and minify");
      // All good!
      done();
    });
  },
  timeoutMS * 6
);
