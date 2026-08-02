import type { ModelDefinition } from "../core.js";
import { modelJson, weightBundles } from "../model_imports/inception_v3.js";

export const InceptionV3Model: ModelDefinition = {
  name: "InceptionV3",
  numOfWeightBundles: 6,
  options: { size: 299 },
  modelJson,
  weightBundles,
};
