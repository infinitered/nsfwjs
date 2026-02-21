import { useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { useNSFWJS } from "../contexts/NSFWJS";
import type { Message } from "../nsfwjs.worker";

const base64ToBlob = (base64: string) => {
  const byteString = atob(base64.split(",")[1]); // Decode Base64
  const mimeType = base64.match(/data:(.*?);base64/)?.[1]; // Extract MIME type
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return new Blob([ab], { type: mimeType });
};

const DETECTION_INTERVAL = 1000;

const Cam = () => {
  const { worker, blurProtection, cameraAvailable, setCameraAvailable, setPredictions, blur } =
    useNSFWJS();

  const webcamRef = useRef<Webcam>(null);

  useEffect(() => {
    (async () => {
      try {
        await navigator.mediaDevices.getUserMedia({ video: true });
        setCameraAvailable(true);
      } catch {
        setCameraAvailable(false);
        window.alert(
          "Access to a camera is not available. Make sure you have allowed permission to access the Camera.",
        );
      }
    })();
  }, [setCameraAvailable]);

  useEffect(() => {
    if (!cameraAvailable) return;

    const detectWebcam = () => {
      if (!webcamRef.current?.stream?.active) {
        setCameraAvailable(false);
        return;
      }

      const imageSrc = webcamRef.current?.getScreenshot();
      if (!imageSrc) return;
      const file = base64ToBlob(imageSrc);
      worker?.postMessage({ type: "predict", file } as Message);
    };

    const interval = setInterval(detectWebcam, DETECTION_INTERVAL);

    return () => {
      setPredictions([]);
      clearInterval(interval);
    };
  }, [cameraAvailable, worker, setCameraAvailable, setPredictions]);

  return (
    <Webcam
      id="capCam"
      ref={webcamRef}
      style={blurProtection && blur ? { filter: "blur(30px)" } : {}}
      audio={false}
      width={640}
      height={460}
      videoConstraints={{
        width: 640,
        height: 460,
        facingMode: "environment",
      }}
      disablePictureInPicture
    />
  );
};

export default Cam;
