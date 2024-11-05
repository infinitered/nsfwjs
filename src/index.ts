import * as tf from "@tensorflow/tfjs";
// Remove the trailing slash below if this Bun issue gets fixed: https://github.com/oven-sh/bun/issues/8683
import { Buffer } from "buffer/";
import { NSFW_CLASSES } from "./nsfw_classes";

declare global {
  namespace NodeJS {
    interface Global {
      [x: string]: any;
    }
  }
  interface Window {
    [x: string]: any;
  }
}

type IOHandler = tf.io.IOHandler;
type ModelJSON = tf.io.ModelJSON;
type ModelArtifacts = tf.io.ModelArtifacts;
type WeightDataBase64 = { [x: string]: string };

export type FrameResult = {
  index: number;
  totalFrames: number;
  predictions: Array<PredictionType>;
  image: HTMLCanvasElement | ImageData;
};

export type ClassifyConfig = {
  topk?: number;
  fps?: number;
  onFrame?: (result: FrameResult) => any;
};

interface NSFWJSOptions {
  size?: number;
  type?: string;
}

export type PredictionType = {
  className: (typeof NSFW_CLASSES)[keyof typeof NSFW_CLASSES];
  probability: number;
};

export type ModelName = "MobileNetV2" | "MobileNetV2Mid" | "InceptionV3";

type ModelConfig = {
  [key in ModelName]: {
    numOfWeightBundles: number;
    options?: NSFWJSOptions;
  };
};

const availableModels: ModelConfig = {
  MobileNetV2: { numOfWeightBundles: 1 },
  MobileNetV2Mid: {
    numOfWeightBundles: 2,
    options: { type: "graph" },
  },
  InceptionV3: {
    numOfWeightBundles: 6,
    options: { size: 299 },
  },
};

const DEFAULT_MODEL_NAME: ModelName = "MobileNetV2";
const IMAGE_SIZE = 224; // default to Mobilenet v2

const getGlobal = () => {
  if (typeof globalThis !== "undefined")
    return globalThis as typeof globalThis & NodeJS.Global & Window;
  if (typeof global !== "undefined")
    return global as typeof globalThis & NodeJS.Global & Window;
  if (typeof window !== "undefined")
    return window as typeof globalThis & NodeJS.Global & Window;
  if (typeof self !== "undefined")
    return self as typeof globalThis & NodeJS.Global & Window;
  throw new Error("Unable to locate global object");
};

function isModelName(name?: string): name is ModelName {
  return !!name && name in availableModels;
}

const getModelJson = async (modelName: ModelName) => {
  const globalModel = getGlobal().model;

  if (globalModel) {
    // If the model is available globally (UMD via script tag), return it
    return globalModel;
  }

  let modelJson;

  if (modelName === "MobileNetV2")
    ({ modelJson } = await import("./model_imports/mobilenet_v2"));
  else if (modelName === "MobileNetV2Mid")
    ({ modelJson } = await import("./model_imports/mobilenet_v2_mid"));
  else if (modelName === "InceptionV3")
    ({ modelJson } = await import("./model_imports/inception_v3"));

  return (await modelJson()).default;
};

const getWeightData = async (
  modelName: ModelName
): Promise<WeightDataBase64> => {
  const { numOfWeightBundles } = availableModels[modelName];
  const bundles: WeightDataBase64[] = [];

  for (let i = 0; i < numOfWeightBundles; i++) {
    const bundleName = `group1-shard${i + 1}of${numOfWeightBundles}`;
    const identifier = bundleName.replace(/-/g, "_");

    const globalWeight = getGlobal()[identifier];
    if (globalWeight) {
      // If the weight data bundle is available globally (UMD via script tag), use it
      bundles.push({ [bundleName]: globalWeight });
    } else {
      let weightBundles;

      if (modelName === "MobileNetV2")
        ({ weightBundles } = await import("./model_imports/mobilenet_v2"));
      else if (modelName === "MobileNetV2Mid")
        ({ weightBundles } = await import("./model_imports/mobilenet_v2_mid"));
      else if (modelName === "InceptionV3")
        ({ weightBundles } = await import("./model_imports/inception_v3"));

      const weight = (await weightBundles[i]()).default;
      bundles.push({ [bundleName]: weight });
    }
  }

  return Object.assign({}, ...bundles);
};

async function loadWeights(modelName: ModelName): Promise<WeightDataBase64> {
  try {
    const weightDataBundles = await getWeightData(modelName);
    return weightDataBundles;
  } catch {
    throw new Error(
      `Could not load the weight data. Make sure you are importing the correct shard files from the models directory. Ref: https://github.com/infinitered/nsfwjs?tab=readme-ov-file#browserify`
    );
  }
}

async function loadModel(modelName: ModelName | string) {
  if (!isModelName(modelName)) return modelName; // Custom url for the model provided

  try {
    const modelJson = await getModelJson(modelName);
    const weightData = await loadWeights(modelName);
    const handler = new JSONHandler(modelJson, weightData);
    return handler;
  } catch {
    throw new Error(
      `Could not load the model. Make sure you are importing the model.min.js bundle. Ref: https://github.com/infinitered/nsfwjs?tab=readme-ov-file#browserify`
    );
  }
}

export async function load(modelOrUrl?: ModelName): Promise<NSFWJS>;

export async function load(
  modelOrUrl?: string,
  options?: NSFWJSOptions
): Promise<NSFWJS>;

export async function load(
  modelOrUrl?: string,
  options: NSFWJSOptions = { size: IMAGE_SIZE }
) {
  if (tf == null) {
    throw new Error(
      `Cannot find TensorFlow.js. If you are using a <script> tag, please ` +
        `also include @tensorflow/tfjs on the page before using this model.`
    );
  }
  if (modelOrUrl === undefined) {
    modelOrUrl = DEFAULT_MODEL_NAME;
    console.info(
      `%cBy not specifying 'modelOrUrl' parameter, you're using the default model: '${modelOrUrl}'. See NSFWJS docs for instructions on hosting your own model (https://github.com/infinitered/nsfwjs?tab=readme-ov-file#host-your-own-model).`,
      "color: lightblue"
    );
  } else if (isModelName(modelOrUrl)) {
    console.info(
      `%cYou're using the model: '${modelOrUrl}'. See NSFWJS docs for instructions on hosting your own model (https://github.com/infinitered/nsfwjs?tab=readme-ov-file#host-your-own-model).`,
      "color: lightblue"
    );
    options = availableModels[modelOrUrl].options ?? options;
  }
  // Default size is IMAGE_SIZE - needed if just type option is used
  options.size = options?.size || IMAGE_SIZE;
  const modelUrlOrHandler = await loadModel(modelOrUrl);
  const nsfwnet = new NSFWJS(modelUrlOrHandler, options);
  await nsfwnet.load();
  return nsfwnet;
}

class JSONHandler implements IOHandler {
  private modelJson: ModelJSON;
  private weightDataBase64: WeightDataBase64;

  constructor(modelJson: ModelJSON, weightDataBase64: WeightDataBase64) {
    this.modelJson = modelJson;
    this.weightDataBase64 = weightDataBase64;
  }

  arrayBufferFromBase64(base64: string) {
    const binaryString = Buffer.from(base64, "base64").toString("binary");
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  }

  async load() {
    const modelArtifacts: ModelArtifacts = {
      modelTopology: this.modelJson.modelTopology,
      format: this.modelJson.format,
      generatedBy: this.modelJson.generatedBy,
      convertedBy: this.modelJson.convertedBy,
    };

    if (this.modelJson.weightsManifest != null) {
      const weightSpecs: ModelArtifacts["weightSpecs"] = [];
      const weightData: Uint8Array[] = [];
      for (const group of this.modelJson.weightsManifest) {
        for (const path of group.paths) {
          const base64 = this.weightDataBase64[path];
          if (!base64) {
            throw new Error(
              `Could not find the weight data. Make sure you are importing the correct weight bundle for the model: ${path}.min.js.`
            );
          }
          const buffer = this.arrayBufferFromBase64(base64);
          weightData.push(new Uint8Array(buffer));
        }
        weightSpecs.push(...group.weights);
      }
      modelArtifacts.weightSpecs = weightSpecs;

      const weightDataConcat = new Uint8Array(
        weightData.reduce((a, b) => a + b.length, 0)
      );
      let offset = 0;
      for (let i = 0; i < weightData.length; i++) {
        weightDataConcat.set(weightData[i], offset);
        offset += weightData[i].byteLength;
      }
      modelArtifacts.weightData = weightDataConcat.buffer;
    }

    if (this.modelJson.trainingConfig != null) {
      modelArtifacts.trainingConfig = this.modelJson.trainingConfig;
    }

    if (this.modelJson.userDefinedMetadata != null) {
      modelArtifacts.userDefinedMetadata = this.modelJson.userDefinedMetadata;
    }

    return modelArtifacts;
  }
}

export class NSFWJS {
  public endpoints: string[];
  public model: tf.LayersModel | tf.GraphModel;

  private options: NSFWJSOptions;
  private urlOrIOHandler: string | IOHandler;
  private intermediateModels: { [layerName: string]: tf.LayersModel } = {};
  private normalizationOffset: tf.Scalar;

  constructor(modelUrlOrIOHandler: string | IOHandler, options: NSFWJSOptions) {
    this.options = options;
    this.normalizationOffset = tf.scalar(255);
    this.urlOrIOHandler = modelUrlOrIOHandler;

    if (
      typeof modelUrlOrIOHandler === "string" &&
      !modelUrlOrIOHandler.startsWith("indexeddb://") &&
      !modelUrlOrIOHandler.startsWith("localstorage://") &&
      !modelUrlOrIOHandler.endsWith("model.json")
    ) {
      this.urlOrIOHandler = `${modelUrlOrIOHandler}model.json`;
    } else {
      this.urlOrIOHandler = modelUrlOrIOHandler;
    }
  }

  async load() {
    const { size, type } = this.options;
    if (type === "graph") {
      this.model = await tf.loadGraphModel(this.urlOrIOHandler);
    } else {
      // this is a Layers Model
      this.model = await tf.loadLayersModel(this.urlOrIOHandler);
      this.endpoints = this.model.layers.map((l) => l.name);
    }

    // Warmup the model.
    const result = tf.tidy(() =>
      this.model.predict(tf.zeros([1, size!, size!, 3]))
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
        `Unknown endpoint ${endpoint}. Available endpoints: ${this.endpoints}.`
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
          [size!, size!],
          alignCorners
        );
      }

      // Reshape to a single-element batch so we can pass it to predict.
      const batched = resized.reshape([1, size!, size!, 3]);

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
  ): Promise<Array<PredictionType>> {
    const logits = this.infer(img) as tf.Tensor2D;

    const classes = await getTopKClasses(logits, topk);

    logits.dispose();

    return classes;
  }
}

async function getTopKClasses(
  logits: tf.Tensor2D,
  topK: number
): Promise<Array<PredictionType>> {
  const values = await logits.data();

  const valuesAndIndices: {
    value: (typeof values)[number];
    index: number;
  }[] = [];
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

  const topClassesAndProbs: PredictionType[] = [];
  for (let i = 0; i < topkIndices.length; i++) {
    topClassesAndProbs.push({
      className: NSFW_CLASSES[topkIndices[i]],
      probability: topkValues[i],
    });
  }
  return topClassesAndProbs;
}
