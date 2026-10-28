import type { ModelName, NSFWJS, PredictionType } from "nsfwjs";
import { load } from "nsfwjs/core";

let tfReadyPromise: Promise<void> | null = null;

const ensureTfReady = async () => {
  if (tfReadyPromise) {
    return tfReadyPromise;
  }

  tfReadyPromise = (async () => {
    const tf = await import("@tensorflow/tfjs");
    await import("@tensorflow/tfjs-backend-webgpu");
    tf.enableProdMode();
    await tf.setBackend("webgpu").catch(() => false);
    await tf.ready();
  })().catch((error) => {
    tfReadyPromise = null;
    throw error;
  });

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
  error?: string;
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

// Raw model.json + binary shards copied into public/models by scripts/copy-models.mjs.
// Loading them by URL avoids the ~33% base64 overhead of the bundled models.
const modelDirs: Record<ModelName, string> = {
  MobileNetV2: "mobilenet_v2",
  MobileNetV2Mid: "mobilenet_v2_mid",
  InceptionV3: "inception_v3",
};

const modelUrl = (modelName: ModelName) =>
  new URL(
    `${import.meta.env.BASE_URL}models/${modelDirs[modelName]}/model.json`,
    self.location.origin
  ).href;

let model: NSFWJS | null = null;
let loadedModelName: ModelName | null = null;

onmessage = async (event: MessageEvent<Message>) => {
  const type = event.data.type;
  const modelName = event.data.modelName;
  const file = event.data.file;

  if (type === "load" && modelName) {
    try {
      if (model && loadedModelName === modelName) {
        postMessage({ modelLoaded: true } as ReturnMessage);
        return;
      }

      await ensureTfReady();

      try {
        model = await load(`indexeddb://${modelName}`, modelOptions[modelName]);
        console.info("Loaded from IndexedDB cache");
      } catch {
        model = await load(modelUrl(modelName), modelOptions[modelName]);
        await model.model.save(`indexeddb://${modelName}`);
      }

      loadedModelName = modelName;
      postMessage({ modelLoaded: true } as ReturnMessage);
    } catch (error) {
      postMessage({
        modelLoaded: false,
        error: error instanceof Error ? error.message : "Failed to load model",
      } as ReturnMessage);
    }
  } else if (type === "predict" && file) {
    if (!model) {
      postMessage({ error: "Model is not loaded" } as ReturnMessage);
      return;
    }

    const offscreenCanvas = new OffscreenCanvas(1, 1);
    const ctx = offscreenCanvas.getContext("2d");

    if (!ctx) {
      postMessage({ error: "2D canvas context is unavailable" } as ReturnMessage);
      return;
    }

    const imgBitmap = await createImageBitmap(file);

    offscreenCanvas.width = imgBitmap.width;
    offscreenCanvas.height = imgBitmap.height;

    try {
      ctx.drawImage(imgBitmap, 0, 0);
      const imageData = ctx.getImageData(0, 0, imgBitmap.width, imgBitmap.height);
      const predictions = await model.classify(imageData);
      postMessage({ predictions } as ReturnMessage);
    } catch (error) {
      postMessage({
        error: error instanceof Error ? error.message : "Prediction failed",
      } as ReturnMessage);
    } finally {
      imgBitmap.close();
    }
  }
};
