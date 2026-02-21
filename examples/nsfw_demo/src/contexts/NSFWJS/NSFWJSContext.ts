import type { ModelName, PredictionType } from "nsfwjs";
import { createContext } from "react";
import type { Dispatch, SetStateAction } from "react";

type NSFWJSContextType = {
  worker: Worker | null;
  webCamEnabled: boolean;
  setWebCamEnabled: Dispatch<SetStateAction<boolean>>;
  blurProtection: boolean;
  setBlurProtection: Dispatch<SetStateAction<boolean>>;
  modelName: ModelName;
  setModelName: Dispatch<SetStateAction<ModelName>>;
  modelLoaded: boolean;
  setModelLoaded: Dispatch<SetStateAction<boolean>>;
  file: File | undefined;
  setFile: Dispatch<SetStateAction<File | undefined>>;
  preview: string | undefined;
  setPreview: Dispatch<SetStateAction<string | undefined>>;
  cameraAvailable: boolean;
  setCameraAvailable: Dispatch<SetStateAction<boolean>>;
  predictions: PredictionType[];
  setPredictions: Dispatch<SetStateAction<PredictionType[]>>;
  blur: boolean;
  setBlur: Dispatch<SetStateAction<boolean>>;
  currentImageBlur: boolean;
  setCurrentImageBlur: Dispatch<SetStateAction<boolean>>;
};

export const NSFWJSContext = createContext<NSFWJSContextType | null>(null);
