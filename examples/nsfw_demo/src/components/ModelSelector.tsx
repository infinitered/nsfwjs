import type { ModelName } from "nsfwjs";
import type { ChangeEvent } from "react";
import { useNSFWJS } from "../contexts/NSFWJS";

type Option = {
  label: string;
  value: ModelName;
};

type Group = {
  label: string;
  options: Option[];
};

const optionsGroups: Group[] = [
  {
    label: "Mobilenet v2 Model",
    options: [
      {
        value: "MobileNetV2",
        label: "90% Accurate - 2.6MB",
      },
      {
        value: "MobileNetV2Mid",
        label: "93% Accurate - 4.2MB",
      },
    ],
  },
  {
    label: "Inception v3 Model",
    options: [
      {
        value: "InceptionV3",
        label: "93% Accurate - Huge!",
      },
    ],
  },
];

const ModelSelector = () => {
  const { modelName, setModelName } = useNSFWJS();

  const onChange = (e: ChangeEvent<HTMLSelectElement>) => {
    setModelName(e.target.value as ModelName);
  };

  return (
    <div
      id="modelSelector"
      className="flex max-w-full flex-col justify-center gap-x-4 gap-y-1 sm:flex-row sm:items-center"
    >
      <p className="text-lg sm:text-xl">Currently Using:</p>
      <select
        className="truncate rounded-lg border-r-8 border-r-transparent bg-gray-700 p-2 text-lg sm:text-xl"
        value={modelName}
        onChange={onChange}
      >
        {optionsGroups.map((g) => (
          <optgroup key={g.label} className="text-text-disabled" label={g.label}>
            {g.options.map((o) => (
              <option key={o.label} className="text-text-primary" value={o.value}>
                {o.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
};

export default ModelSelector;
