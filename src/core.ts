import * as tf from "@tensorflow/tfjs";
import { Buffer } from "buffer";
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

/** Result payload emitted by frame-based classify callbacks. */
export type FrameResult = {
  index: number;
  totalFrames: number;
  predictions: Array<PredictionType>;
  image: HTMLCanvasElement | ImageData;
};

/** Options for frame-by-frame classification helpers. */
export type ClassifyConfig = {
  topk?: number;
  fps?: number;
  onFrame?: (result: FrameResult) => any;
};

/** Model loading options used by both root and core entrypoints. */
export interface NSFWJSOptions {
  size?: number;
  type?: string;
}

/** Single class probability output. */
export type PredictionType = {
  className: (typeof NSFW_CLASSES)[keyof typeof NSFW_CLASSES];
  probability: number;
};

/** Built-in bundled model identifiers. */
export type ModelName = "MobileNetV2" | "MobileNetV2Mid" | "InceptionV3";

/**
 * Descriptor for a bundled model and its shard loaders.
 * Used by `load(..., { modelDefinitions })` in the `nsfwjs/core` entrypoint.
 */
export type ModelDefinition = {
  name: ModelName;
  numOfWeightBundles: number;
  options?: NSFWJSOptions;
  modelJson: () => Promise<{ default: ModelJSON }>;
  weightBundles: Array<() => Promise<{ default: string }>>;
};

/** Advanced load options for selective model registries. */
export interface LoadOptions extends NSFWJSOptions {
  modelDefinitions?: ModelDefinition[];
}

type ModelConfig = {
  [key in ModelName]: ModelDefinition;
};

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

function getModelConfig(models: ModelDefinition[]): Partial<ModelConfig> {
  const config: Partial<ModelConfig> = {};
  models.forEach((model) => {
    config[model.name] = model;
  });
  return config;
}

function isModelName(name?: string): name is ModelName {
  return name === "MobileNetV2" ||
    name === "MobileNetV2Mid" ||
    name === "InceptionV3";
}

const getModelJson = async (
  modelName: ModelName,
  availableModels: Partial<ModelConfig>
) => {
  const globalModel = getGlobal().model;

  if (globalModel) {
    // If the model is available globally (UMD via script tag), return it
    return globalModel;
  }

  const model = availableModels[modelName];

  if (!model) {
    throw new Error(
      `Model '${modelName}' was not found in the provided models registry.`
    );
  }

  return (await model.modelJson()).default;
};

const getWeightData = async (
  modelName: ModelName,
  availableModels: Partial<ModelConfig>
): Promise<WeightDataBase64> => {
  const model = availableModels[modelName];

  if (!model) {
    throw new Error(
      `Model '${modelName}' was not found in the provided models registry.`
    );
  }

  const { numOfWeightBundles, weightBundles } = model;
  const bundles: WeightDataBase64[] = [];

  for (let i = 0; i < numOfWeightBundles; i++) {
    const bundleName = `group1-shard${i + 1}of${numOfWeightBundles}`;
    const identifier = bundleName.replace(/-/g, "_");

    const globalWeight = getGlobal()[identifier];
    if (globalWeight) {
      // If the weight data bundle is available globally (UMD via script tag), use it
      bundles.push({ [bundleName]: globalWeight });
    } else {
      const weightBundle = weightBundles[i];
      if (!weightBundle) {
        throw new Error(
          `Could not find a weight bundle loader for '${modelName}' at index ${i}.`
        );
      }

      const weight = (await weightBundle()).default;
      bundles.push({ [bundleName]: weight });
    }
  }

  return Object.assign({}, ...bundles);
};

async function loadWeights(
  modelName: ModelName,
  availableModels: Partial<ModelConfig>
): Promise<WeightDataBase64> {
  try {
    const weightDataBundles = await getWeightData(modelName, availableModels);
    return weightDataBundles;
  } catch (error) {
    if (error instanceof Error && /provided models registry/.test(error.message)) {
      throw error;
    }

    throw new Error(
      `Could not load the weight data. Make sure you are importing the correct shard files from the models directory. Ref: https://github.com/infinitered/nsfwjs?tab=readme-ov-file#browserify`
    );
  }
}

async function loadModel(
  modelName: ModelName | string,
  availableModels: Partial<ModelConfig>
) {
  if (!isModelName(modelName)) return modelName; // Custom url for the model provided

  try {
    const modelJson = await getModelJson(modelName, availableModels);
    const weightData = await loadWeights(modelName, availableModels);
    const handler = new JSONHandler(modelJson, weightData);
    return handler;
  } catch (error) {
    if (error instanceof Error && /provided models registry/.test(error.message)) {
      throw error;
    }

    throw new Error(
      `Could not load the model. Make sure you are importing the model.min.js bundle. Ref: https://github.com/infinitered/nsfwjs?tab=readme-ov-file#browserify`
    );
  }
}

export async function load(modelOrUrl: ModelName): Promise<NSFWJS>;

export async function load(
  modelOrUrl: string,
  options?: LoadOptions
): Promise<NSFWJS>;

/**
 * Loads an NSFWJS model from a built-in model name or custom model URL.
 *
 * In `nsfwjs/core`, pass `modelDefinitions` to control which bundled model
 * loaders are available to this call.
 */
export async function load(
  modelOrUrl: string,
  options: LoadOptions = { size: IMAGE_SIZE }
) {
  if (tf == null) {
    throw new Error(
      `Cannot find TensorFlow.js. If you are using a <script> tag, please ` +
      `also include @tensorflow/tfjs on the page before using this model.`
    );
  }

  const availableModels = getModelConfig(options.modelDefinitions || []);

  if (isModelName(modelOrUrl)) {
    console.info(
      `%cYou're using the model: '${modelOrUrl}'. See NSFWJS docs for instructions on hosting your own model (https://github.com/infinitered/nsfwjs?tab=readme-ov-file#host-your-own-model).`,
      "color: lightblue"
    );

    const model = availableModels[modelOrUrl];
    if (model?.options) {
      options = { ...options, ...model.options };
    }
  }

  // Default size is IMAGE_SIZE - needed if just type option is used
  options.size = options?.size || IMAGE_SIZE;
  const modelUrlOrHandler = await loadModel(modelOrUrl, availableModels);
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

/** Loaded NSFWJS model wrapper with infer/classify/dispose helpers. */
export class NSFWJS {
  public endpoints: string[] = [];
  public model: tf.LayersModel | tf.GraphModel;

  private options: NSFWJSOptions;
  private urlOrIOHandler: string | IOHandler;
  private intermediateModels: { [layerName: string]: tf.LayersModel } = {};
  private normalizationOffset: tf.Scalar;
  private disposed = false;

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
    if (this.disposed) {
      throw new Error("This NSFWJS instance has been disposed.");
    }

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
   * Infers through the loaded model. Optionally takes an endpoint to return an
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
    if (this.disposed) {
      throw new Error("This NSFWJS instance has been disposed.");
    }

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
    if (this.disposed) {
      throw new Error("This NSFWJS instance has been disposed.");
    }

    const logits = this.infer(img) as tf.Tensor2D;

    const classes = await getTopKClasses(logits, topk);

    logits.dispose();

    return classes;
  }

  /**
   * Disposes loaded TensorFlow resources held by this instance.
   * Safe to call multiple times.
   */
  dispose() {
    if (this.disposed) {
      return;
    }

    Object.values(this.intermediateModels).forEach((intermediateModel) => {
      intermediateModel.dispose();
    });
    this.intermediateModels = {};

    if (this.model) {
      this.model.dispose();
    }

    this.normalizationOffset.dispose();
    this.disposed = true;
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
