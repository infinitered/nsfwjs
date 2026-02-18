import type { ModelDefinition } from "../core";
import { modelJson, weightBundles } from "../model_imports/inception_v3";

export const InceptionV3Model: ModelDefinition = {
  name: "InceptionV3",
  numOfWeightBundles: 6,
  options: { size: 299 },
  modelJson,
  weightBundles,
};
