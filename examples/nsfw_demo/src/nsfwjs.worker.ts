import type { ModelName, NSFWJS, PredictionType } from "nsfwjs";
import { load } from "nsfwjs/core";
import { InceptionV3Model } from "nsfwjs/models/inception_v3";
import { MobileNetV2Model } from "nsfwjs/models/mobilenet_v2";
import { MobileNetV2MidModel } from "nsfwjs/models/mobilenet_v2_mid";

let tfReadyPromise: Promise<void> | null = null;

const ensureTfReady = async () => {
  if (tfReadyPromise) {
    return tfReadyPromise;
  }

  tfReadyPromise = (async () => {
    const tf = await import("@tensorflow/tfjs");
    await import("@tensorflow/tfjs-backend-webgpu");
    tf.enableProdMode();
    await tf.ready();
  })();

  return tfReadyPromise;
};

export type Message = {
  type: "load" | "predict";
  modelName?: ModelName;
  file?: File;
};

export type ReturnMessage = {
  modelLoaded?: boolean;
  predictions?: PredictionType[];
};

interface NSFWJSOptions {
  size?: number;
  type?: string;
}

type ModelConfig = {
  [key in ModelName]: NSFWJSOptions;
};

const modelOptions: ModelConfig = {
  MobileNetV2: {},
  MobileNetV2Mid: { type: "graph" },
  InceptionV3: { size: 299 },
};

let model: NSFWJS;

onmessage = async (event: MessageEvent<Message>) => {
  const type = event.data.type;
  const modelName = event.data.modelName;
  const file = event.data.file;

  if (type === "load" && modelName) {
    await ensureTfReady();

    let dbExists = false;
    const request = indexedDB.open(modelName);

    dbExists = await new Promise((resolve) => {
      request.onupgradeneeded = function (e) {
        (e.target as IDBOpenDBRequest)?.transaction?.abort();
        console.log("no db");
        resolve(false);
      };
      request.onsuccess = function () {
        console.log("db");
        resolve(true);
      };
      request.onerror = function () {
        indexedDB.deleteDatabase(modelName);
        resolve(false);
      };
    });

    if (dbExists) {
      model = await load(`indexeddb://${modelName}`, modelOptions[modelName]);
    } else {
      model = await load(modelName, {
        modelDefinitions: [MobileNetV2Model, MobileNetV2MidModel, InceptionV3Model],
      });
      indexedDB.open(modelName);
      await model.model.save(`indexeddb://${modelName}`);
    }

    postMessage({ modelLoaded: !!model } as ReturnMessage);
  } else if (type === "predict" && file && model) {
    if (!file) return;

    // Create a new OffscreenCanvas for image processing
    const offscreenCanvas = new OffscreenCanvas(1, 1); // Initial size
    const ctx = offscreenCanvas.getContext("2d");

    if (!ctx) return;

    // Create an image object
    const imgBitmap = await createImageBitmap(file);

    // Adjust canvas size to image dimensions
    offscreenCanvas.width = imgBitmap.width;
    offscreenCanvas.height = imgBitmap.height;

    // Draw the image onto the OffscreenCanvas
    ctx.drawImage(imgBitmap, 0, 0);

    // Extract ImageData from the OffscreenCanvas
    const imageData = ctx.getImageData(0, 0, imgBitmap.width, imgBitmap.height);

    const predictions = await model.classify(imageData);
    postMessage({ predictions } as ReturnMessage);
  }
};
