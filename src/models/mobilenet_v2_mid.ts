import type { ModelDefinition } from "../core.js";
import { modelJson, weightBundles } from "../model_imports/mobilenet_v2_mid.js";

export const MobileNetV2MidModel: ModelDefinition = {
  name: "MobileNetV2Mid",
  numOfWeightBundles: 2,
  options: { type: "graph" },
  modelJson,
  weightBundles,
};
