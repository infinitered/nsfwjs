import type { ModelDefinition } from "../core.js";
import { modelJson, weightBundles } from "../model_imports/mobilenet_v2.js";

export const MobileNetV2Model: ModelDefinition = {
  name: "MobileNetV2",
  numOfWeightBundles: 1,
  modelJson,
  weightBundles,
};
