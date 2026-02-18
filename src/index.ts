import {
  load as loadCore,
  type ModelName,
  type NSFWJSOptions,
  type NSFWJS,
} from "./core";
import { DEFAULT_MODELS } from "./default_models";

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
  const resolvedOptions = {
    ...options,
    modelDefinitions: DEFAULT_MODELS,
  };

  return loadCore(modelOrUrl, resolvedOptions);
}
