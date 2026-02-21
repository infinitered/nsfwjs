import { useNSFWJS } from "../contexts/NSFWJS";

const StatusTitle = () => {
  const { webCamEnabled, modelLoaded, cameraAvailable } = useNSFWJS();

  return (
    <div id="status">
      <p id="statusMessage" className="text-center text-xl sm:text-2xl">
        {modelLoaded
          ? webCamEnabled
            ? cameraAvailable
              ? "Camera is active!"
              : "Looking for a camera..."
            : "Drag and drop or tap to add an image to check!"
          : "The model is loading, please wait..."}
      </p>
    </div>
  );
};

export default StatusTitle;
