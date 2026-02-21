import {
  load as loadCore,
  type ModelName,
  type NSFWJSOptions,
  type NSFWJS,
} from "./core";
import { DEFAULT_MODELS } from "./default_models";

const DEFAULT_MODEL_NAME: ModelName = "MobileNetV2";

export { NSFWJS } from "./core";
export type {
  ClassifyConfig,
  FrameResult,
  ModelDefinition,
  ModelName,
  NSFWJSOptions,
  PredictionType,
} from "./core";

export async function load(modelOrUrl?: ModelName): Promise<NSFWJS>;

export async function load(
  modelOrUrl?: string,
  options?: NSFWJSOptions
): Promise<NSFWJS>;

export async function load(modelOrUrl?: string, options?: NSFWJSOptions) {
  const resolvedModelOrUrl = modelOrUrl || DEFAULT_MODEL_NAME;

  if (modelOrUrl === undefined) {
    console.info(
      `%cBy not specifying 'modelOrUrl' parameter, you're using the default model: '${resolvedModelOrUrl}'. See NSFWJS docs for instructions on hosting your own model (https://github.com/infinitered/nsfwjs?tab=readme-ov-file#host-your-own-model).`,
      "color: lightblue"
    );
  }

  const resolvedOptions = {
    ...options,
    modelDefinitions: DEFAULT_MODELS,
  };

  return loadCore(resolvedModelOrUrl, resolvedOptions);
}
