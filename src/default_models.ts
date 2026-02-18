import type { ModelDefinition } from "./core";
import { InceptionV3Model } from "./models/inception_v3";
import { MobileNetV2Model } from "./models/mobilenet_v2";
import { MobileNetV2MidModel } from "./models/mobilenet_v2_mid";

export const DEFAULT_MODELS: ModelDefinition[] = [
  MobileNetV2Model,
  MobileNetV2MidModel,
  InceptionV3Model,
];
