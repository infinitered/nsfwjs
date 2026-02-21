import { Cam, FileDrop, Loading } from ".";
import { useNSFWJS } from "../contexts/NSFWJS";

const ImageInput = () => {
  const { webCamEnabled, modelLoaded, preview, predictions } = useNSFWJS();

  return (
    <div className="relative">
      {webCamEnabled ? (
        <Cam />
      ) : (
        <div id="photoBox" className="border-4 border-dashed border-cyan-500 p-5">
          <FileDrop />
        </div>
      )}
      {(!modelLoaded || (!predictions[0] && preview)) && <Loading />}
    </div>
  );
};

export default ImageInput;
