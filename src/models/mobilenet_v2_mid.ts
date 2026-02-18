import type { ModelDefinition } from "../core";
import { modelJson, weightBundles } from "../model_imports/mobilenet_v2_mid";

export const MobileNetV2MidModel: ModelDefinition = {
  name: "MobileNetV2Mid",
  numOfWeightBundles: 2,
  options: { type: "graph" },
  modelJson,
  weightBundles,
};
