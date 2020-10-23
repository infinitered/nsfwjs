import * as tf from "@tensorflow/tfjs";
import { load } from "../src/index";
import { exec } from "child_process";
const fs = require("fs");
const jpeg = require("jpeg-js");

// Fix for JEST
const globalAny: any = global;
globalAny.fetch = require("node-fetch");
const timeoutMS = 10000;
const NUMBER_OF_CHANNELS = 3;

const readImage = (path: string) => {
  const buf = fs.readFileSync(path);
  const pixels = jpeg.decode(buf, true);
  return pixels;
};

// @ts-ignore
const imageByteArray = (image, numChannels: number) => {
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

// @ts-ignore
const imageToInput = (image, numChannels: number) => {
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
  "Bundles and minifies",
  (done) => {
    const cmd = "yarn scriptbundle && yarn minbundle";
    exec(cmd, (err) => {
      if (err) done.fail("Failed to bundle and minify");
      // All good!
      done();
    });
  },
  timeoutMS * 6
);
