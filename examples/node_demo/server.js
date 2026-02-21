import * as tf from "@tensorflow/tfjs-node";
import express from "express";
import jpeg from "jpeg-js";
import multer from "multer";
import { load } from "nsfwjs";

const app = express();
const upload = multer();

let model;

const convert = async (img) => {
  // Decoded image in UInt8 Byte array
  const image = jpeg.decode(img, true);

  const numChannels = 3;
  const numPixels = image.width * image.height;
  const values = new Int32Array(numPixels * numChannels);

  for (let i = 0; i < numPixels; i++)
    for (let c = 0; c < numChannels; ++c)
      values[i * numChannels + c] = image.data[i * 4 + c];

  return tf.tensor3d(values, [image.height, image.width, numChannels], "int32");
};

app.post("/nsfw", upload.single("image"), async (req, res) => {
  if (!req.file) res.status(400).send("Missing image multipart/form-data");
  else {
    const image = await convert(req.file.buffer);
    const predictions = await model.classify(image);
    image.dispose();
    res.json(predictions);
  }
});

const loadModel = async () => {
  model = await load();
};

// Keep the model in memory, make sure it's loaded only once
loadModel().then(() => app.listen(8080));
