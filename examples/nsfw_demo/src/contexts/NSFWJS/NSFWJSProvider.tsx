import type { ModelName, PredictionType } from "nsfwjs";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { useEffect, useState } from "react";
import { NSFWJSContext } from ".";
import type { Message, ReturnMessage } from "../../nsfwjs.worker";

const worker = new Worker(new URL("../../nsfwjs.worker", import.meta.url), {
  type: "module",
});

const inappropriateClasses: PredictionType["className"][] = ["Hentai", "Porn", "Sexy"];

export const NSFWJSProvider = ({ children }: { children: ReactNode }) => {
  const [webCamEnabled, setWebCamEnabled] = useState(false);
  const [blurProtection, setBlurProtection] = useState(true);
  const [modelName, setModelNameState] = useState<ModelName>("MobileNetV2Mid");
  const [modelLoaded, setModelLoaded] = useState(false);
  const [file, setFile] = useState<File>();
  const [preview, setPreview] = useState<string>();
  const [cameraAvailable, setCameraAvailable] = useState<boolean>(false);
  const [predictions, setPredictions] = useState<PredictionType[]>([]);
  const [blur, setBlur] = useState(false);
  const [currentImageBlur, setCurrentImageBlur] = useState(false);

  const setModelName: Dispatch<SetStateAction<ModelName>> = (value) => {
    setModelLoaded(false);
    setModelNameState(value);
  };

  useEffect(() => {
    worker.postMessage({ type: "load", modelName } as Message);
  }, [modelName]);

  useEffect(() => {
    worker.onmessage = (event: MessageEvent<ReturnMessage>) => {
      const { modelLoaded, predictions, error } = event.data;

      if (error) window.alert(error);

      if (modelLoaded !== undefined) {
        setModelLoaded(modelLoaded);
        if (!predictions && !webCamEnabled) {
          worker?.postMessage({ type: "predict", file } as Message);
        }
      }

      if ((file || cameraAvailable) && predictions) {
        console.log("predictions", predictions);
        if (preview) URL.revokeObjectURL(preview);
        if (file) setPreview(URL.createObjectURL(file));
        setPredictions(predictions);
        setBlur(inappropriateClasses.includes(predictions[0]?.className));
      }
    };
  }, [cameraAvailable, file, preview, webCamEnabled]);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  useEffect(() => {
    if (modelLoaded && !predictions[0] && file) {
      worker?.postMessage({ type: "predict", file } as Message);
    }
  }, [file, modelLoaded, predictions]);

  return (
    <NSFWJSContext.Provider
      value={{
        worker,
        webCamEnabled,
        setWebCamEnabled,
        blurProtection,
        setBlurProtection,
        modelName,
        setModelName,
        modelLoaded,
        setModelLoaded,
        file,
        setFile,
        preview,
        setPreview,
        cameraAvailable,
        setCameraAvailable,
        predictions,
        setPredictions,
        blur,
        setBlur,
        currentImageBlur,
        setCurrentImageBlur,
      }}
    >
      {children}
    </NSFWJSContext.Provider>
  );
};
