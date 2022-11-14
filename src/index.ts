import * as tf from "@tensorflow/tfjs";
import { NSFW_CLASSES } from "./nsfw_classes";
import gifFrames, { GifFrameCanvas, GifFrameBuffer } from "@nsfw-filter/gif-frames";

export type frameResult = {
  index: number;
  totalFrames: number;
  predictions: Array<predictionType>;
  image: HTMLCanvasElement | ImageData;
}

export type classifyConfig = {
  topk?: number;
  fps?: number;
  onFrame?: (result: frameResult) => any;
}

interface nsfwjsOptions {
  size?: number;
  type?: string;
}

export type predictionType = {
  className: typeof NSFW_CLASSES[keyof typeof NSFW_CLASSES]
  probability: number
}

const BASE_PATH =
  // OLD S3 "https://s3.amazonaws.com/ir_public/nsfwjscdn/TFJS_nsfw_mobilenet/tfjs_quant_nsfw_mobilenet/";
  "https://d1zv2aa70wpiur.cloudfront.net/tfjs_quant_nsfw_mobilenet/";
const IMAGE_SIZE = 224; // default to Mobilenet v2

export async function load(base = BASE_PATH, options: nsfwjsOptions = { size: IMAGE_SIZE }) {
  if (tf == null) {
    throw new Error(
      `Cannot find TensorFlow.js. If you are using a <script> tag, please ` +
        `also include @tensorflow/tfjs on the page before using this model.`
    );
  }
  // Default size is IMAGE_SIZE - needed if just type option is used
  options.size = options.size || IMAGE_SIZE;
  const nsfwnet = new NSFWJS(base, options);
  await nsfwnet.load();
  return nsfwnet;
}

interface IOHandler {
  load: () => any;
}

export class NSFWJS {
  public endpoints: string[];
  public model: tf.LayersModel | tf.GraphModel;

  private options: nsfwjsOptions;
  private pathOrIOHandler: string | IOHandler;
  private intermediateModels: { [layerName: string]: tf.LayersModel } = {};
  private normalizationOffset: tf.Scalar;

  constructor(
    modelPathBaseOrIOHandler: string | IOHandler,
    options: nsfwjsOptions
  ) {
    this.options = options;
    this.normalizationOffset = tf.scalar(255);

    if (
      typeof modelPathBaseOrIOHandler === "string" &&
      !modelPathBaseOrIOHandler.startsWith("indexeddb://") &&
      !modelPathBaseOrIOHandler.startsWith("localstorage://")
    ) {
      if (modelPathBaseOrIOHandler.endsWith("model.json")) {
        this.pathOrIOHandler = modelPathBaseOrIOHandler;
      } else {
        this.pathOrIOHandler = `${modelPathBaseOrIOHandler}model.json`;
      }
    } else {
      this.pathOrIOHandler = modelPathBaseOrIOHandler;
    }
  }

  async load() {
    const { size, type } = this.options;
    if (type === "graph") {
      this.model = await tf.loadGraphModel(this.pathOrIOHandler);
    } else {
      // this is a Layers Model
      this.model = await tf.loadLayersModel(this.pathOrIOHandler);
      this.endpoints = this.model.layers.map((l) => l.name);
    }

    // Warmup the model.
    const result = tf.tidy(() =>
      this.model.predict(tf.zeros([1, size, size, 3]))
    ) as tf.Tensor;
    await result.data();
    result.dispose();
  }

  /**
   * Infers through the model. Optionally takes an endpoint to return an
   * intermediate activation.
   *
   * @param img The image to classify. Can be a tensor or a DOM element image,
   * video, or canvas.
   * @param endpoint The endpoint to infer through. If not defined, returns
   * logits.
   */
  infer(
    img:
      | tf.Tensor3D
      | ImageData
      | HTMLImageElement
      | HTMLCanvasElement
      | HTMLVideoElement,
    endpoint?: string
  ): tf.Tensor {
    if (endpoint != null && this.endpoints.indexOf(endpoint) === -1) {
      throw new Error(
        `Unknown endpoint ${endpoint}. Available endpoints: ` +
          `${this.endpoints}.`
      );
    }

    return tf.tidy(() => {
      if (!(img instanceof tf.Tensor)) {
        img = tf.browser.fromPixels(img);
      }

      // Normalize the image from [0, 255] to [0, 1].
      const normalized = img
        .toFloat()
        .div(this.normalizationOffset) as tf.Tensor3D;

      // Resize the image to
      let resized = normalized;
      const { size } = this.options;
      // check width and height if resize needed
      if (img.shape[0] !== size || img.shape[1] !== size) {
        const alignCorners = true;
        resized = tf.image.resizeBilinear(
          normalized,
          [size, size],
          alignCorners
        );
      }

      // Reshape to a single-element batch so we can pass it to predict.
      const batched = resized.reshape([1, size, size, 3]);

      let model: tf.LayersModel | tf.GraphModel;
      if (endpoint == null) {
        model = this.model;
      } else {
        if (
          this.model.hasOwnProperty("layers") &&
          this.intermediateModels[endpoint] == null
        ) {
          // @ts-ignore
          const layer = this.model.layers.find((l) => l.name === endpoint);
          this.intermediateModels[endpoint] = tf.model({
            // @ts-ignore
            inputs: this.model.inputs,
            outputs: layer.output,
          });
        }
        model = this.intermediateModels[endpoint];
      }

      // return logits
      return model.predict(batched) as tf.Tensor2D;
    });
  }

  /**
   * Classifies an image from the 5 classes returning a map of
   * the most likely class names to their probability.
   *
   * @param img The image to classify. Can be a tensor or a DOM element image,
   * video, or canvas.
   * @param topk How many top values to use. Defaults to 5
   */
  async classify(
    img:
      | tf.Tensor3D
      | ImageData
      | HTMLImageElement
      | HTMLCanvasElement
      | HTMLVideoElement,
    topk = 5
  ): Promise<Array<predictionType>> {
    const logits = this.infer(img) as tf.Tensor2D;

    const classes = await getTopKClasses(logits, topk);

    logits.dispose();

    return classes;
  }

  /**
   * Classifies a gif from the 5 classes returning a map of
   * the most likely class names to their probability.
   *
   * @param gif The gif to classify. DOM element image
   * @param config param configuration for run
   */
  async classifyGif(
    gif: HTMLImageElement | Buffer,
    config: classifyConfig = { topk: 5 }
  ): Promise<Array<Array<predictionType>>> {
    let frameData: (GifFrameCanvas | GifFrameBuffer)[] = []

    if (Buffer.isBuffer(gif)) {
      frameData = await gifFrames({ url: gif, frames: 'all', outputType: 'jpg' });
    } else {
      frameData = await gifFrames({ url: gif.src, frames: 'all', outputType: 'canvas' });
    }

    let acceptedFrames: number[] = [];
    if (typeof config.fps !== 'number') {
      acceptedFrames = frameData.map((_element, index) => index);
    } else {
      let totalTimeInMs = 0;
      for (let i = 0; i < frameData.length; i++) {
        totalTimeInMs = totalTimeInMs + (frameData[i].frameInfo.delay * 10);
      }

      const totalFrames: number = Math.floor(totalTimeInMs / 1000 * config.fps);
      if (totalFrames <= 1) {
        acceptedFrames = [Math.floor(frameData.length / 2)];
      } else if (totalFrames >= frameData.length) {
        acceptedFrames = frameData.map((_element, index) => index);
      } else {
        const interval: number = Math.floor(frameData.length / (totalFrames + 1));
        for (let i = 1; i <= totalFrames; i++) {
          acceptedFrames.push(i * interval);
        }
      }
    }

    const arrayOfPredictions: predictionType[][] = []
    for (let i = 0; i < acceptedFrames.length; i++) {
      const image = frameData[acceptedFrames[i]].getImage()
      const predictions = await this.classify(image, config.topk);

      if (typeof config.onFrame === 'function') {
        config.onFrame({
          index: acceptedFrames[i],
          totalFrames: frameData.length,
          predictions,
          image
        });
      }

      arrayOfPredictions.push(predictions);
    }

    return arrayOfPredictions;
  }
}

async function getTopKClasses(
  logits: tf.Tensor2D,
  topK: number
): Promise<Array<predictionType>> {
  const values = await logits.data();

  const valuesAndIndices = [];
  for (let i = 0; i < values.length; i++) {
    valuesAndIndices.push({ value: values[i], index: i });
  }
  valuesAndIndices.sort((a, b) => {
    return b.value - a.value;
  });
  const topkValues = new Float32Array(topK);
  const topkIndices = new Int32Array(topK);
  for (let i = 0; i < topK; i++) {
    topkValues[i] = valuesAndIndices[i].value;
    topkIndices[i] = valuesAndIndices[i].index;
  }

  const topClassesAndProbs: predictionType[] = [];
  for (let i = 0; i < topkIndices.length; i++) {
    topClassesAndProbs.push({
      className: NSFW_CLASSES[topkIndices[i]],
      probability: topkValues[i],
    });
  }
  return topClassesAndProbs;
}
