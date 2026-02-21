import type { PredictionType } from "nsfwjs";
import { useNSFWJS } from "../contexts/NSFWJS";

const readyMessage = "Ready to Classify!";
const processingMessage = "Processing...";

// Render Text Prediction
const renderPredictions = (predictions: Props["predictions"]) => {
  // only render if predictions is in singular format
  if (predictions[0] && predictions[0].className) {
    return (
      <div id="predictions" className="text-primary-main overflow-auto text-base sm:text-xl">
        <table className="mx-auto table-auto border-collapse border">
          <thead>
            <tr>
              {predictions.map(({ className }) => (
                <th
                  key={className}
                  className="border-text-primary border px-4 text-start font-normal"
                >
                  {className}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              {predictions.map(({ className, probability }) => (
                <td key={className} className="border-text-primary border px-4">
                  {(probability * 100).toFixed(2)}%
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
};

interface Props {
  predictions: PredictionType[];
}

const Results = () => {
  const { modelName, modelLoaded, preview, predictions } = useNSFWJS();

  const message = !modelLoaded
    ? `Loading ${modelName} Model...`
    : predictions[0]
      ? `Identified as ${predictions[0].className}`
      : preview
        ? processingMessage
        : readyMessage;

  return (
    <div id="results" className="w-full space-y-4">
      <p className="mx-auto w-fit border-b text-center text-xl font-bold sm:text-2xl">{message}</p>
      {renderPredictions(predictions)}
    </div>
  );
};

export default Results;
