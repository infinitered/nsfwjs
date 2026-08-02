import type { ModelDefinition } from "./core.js";
import { InceptionV3Model } from "./models/inception_v3.js";
import { MobileNetV2Model } from "./models/mobilenet_v2.js";
import { MobileNetV2MidModel } from "./models/mobilenet_v2_mid.js";

export const DEFAULT_MODELS: ModelDefinition[] = [
  MobileNetV2Model,
  MobileNetV2MidModel,
  InceptionV3Model,
];
