import type { ModelDefinition } from "../core";
import { modelJson, weightBundles } from "../model_imports/mobilenet_v2";

export const MobileNetV2Model: ModelDefinition = {
  name: "MobileNetV2",
  numOfWeightBundles: 1,
  modelJson,
  weightBundles,
};
