import { useState } from "react";
import type { FileRejection } from "react-dropzone";
import Dropzone from "react-dropzone";
import nsfwjsLogo from "../assets/nsfwjs-logo.svg";
import { useNSFWJS } from "../contexts/NSFWJS";
import type { Message } from "../nsfwjs.worker";

const FileDrop = () => {
  const {
    worker,
    blurProtection,
    setFile,
    preview,
    predictions,
    blur,
    currentImageBlur,
    setCurrentImageBlur,
  } = useNSFWJS();

  const [imageLoaded, setImageLoaded] = useState(false);

  const onDropRejected = (fileRejections: FileRejection[]) => {
    const rej = fileRejections[0].errors[0];
    const message =
      rej.code === "too-many-files"
        ? "Select only one file."
        : rej.code === "file-invalid-type"
          ? "Unsupported file format. Please upload an image in one of the following formats: JPEG, PNG, WebP or AVIF."
          : rej.message;

    window.alert(message);
  };

  const onDropAccepted = async (accepted: File[]) => {
    const file = accepted[0];
    setFile(file);
    worker?.postMessage({ type: "predict", file } as Message);
  };

  return (
    <Dropzone
      accept={{
        "image/png": [],
        "image/jpeg": [],
        "image/webp": [],
        "image/avif": [],
      }}
      multiple={false}
      maxFiles={1}
      onDropAccepted={onDropAccepted}
      onDropRejected={onDropRejected}
    >
      {({ getRootProps, getInputProps }) => (
        <div
          {...getRootProps()}
          style={
            blurProtection && currentImageBlur
              ? { filter: "blur(30px)" }
              : !imageLoaded
                ? { opacity: 0.4 }
                : {}
          }
        >
          <img
            className={`mx-auto h-96 object-contain ${preview ? "w-auto" : "w-238.25"}`}
            src={preview || nsfwjsLogo}
            alt="drop your file here"
            onLoad={() => {
              if (predictions[0]) {
                setImageLoaded(true);
                setCurrentImageBlur(blur);
              }
            }}
          />
          <input {...getInputProps()} />
        </div>
      )}
    </Dropzone>
  );
};

export default FileDrop;
