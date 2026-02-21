import * as tf from "@tensorflow/tfjs";
import { ModelName, load } from "../src/index";
import { load as loadCore } from "../src/core";
import { MobileNetV2Model } from "../src/models/mobilenet_v2";

const timeoutMS = 10000;

it(
  "NSFWJS classify doesn't leak",
  async () => {
    const model = await load();
    const x = tf.zeros([224, 224, 3]) as tf.Tensor3D;
    const numTensorsBefore = tf.memory().numTensors;
    await model.classify(x);
    expect(tf.memory().numTensors).toBe(numTensorsBefore);
  },
  timeoutMS
);

it(
  "NSFWJS infer doesn't leak",
  async () => {
    const model = await load();
    const x = tf.zeros([224, 224, 3]) as tf.Tensor3D;
    const numTensorsBefore = tf.memory().numTensors;
    model.infer(x);
    expect(tf.memory().numTensors).toBe(numTensorsBefore + 1);
  },
  timeoutMS
);

it(
  "NSFWJS console informs user if no 'modelOrUrl' parameter is passed",
  async () => {
    const consoleInfoSpy = jest.spyOn(console, "info");
    await load();
    expect(consoleInfoSpy).toHaveBeenCalledWith(
      `%cBy not specifying 'modelOrUrl' parameter, you're using the default model: 'MobileNetV2'. See NSFWJS docs for instructions on hosting your own model (https://github.com/infinitered/nsfwjs?tab=readme-ov-file#host-your-own-model).`,
      "color: lightblue"
    );
  },
  timeoutMS
);

it(
  "NSFWJS console informs user if no hosted model is passed",
  async () => {
    const modelOrUrl: ModelName = "MobileNetV2";
    const consoleInfoSpy = jest.spyOn(console, "info");
    await load(modelOrUrl);
    expect(consoleInfoSpy).toHaveBeenCalledWith(
      `%cYou're using the model: '${modelOrUrl}'. See NSFWJS docs for instructions on hosting your own model (https://github.com/infinitered/nsfwjs?tab=readme-ov-file#host-your-own-model).`,
      "color: lightblue"
    );
  },
  timeoutMS
);

it(
  "NSFWJS throws when named model is not in models registry",
  async () => {
    await expect(
      loadCore("MobileNetV2", { modelDefinitions: [] })
    ).rejects.toThrow(
      "provided models registry"
    );
  },
  timeoutMS
);

it(
  "NSFWJS core load works with explicit modelDefinitions",
  async () => {
    const model = await loadCore("MobileNetV2", {
      modelDefinitions: [MobileNetV2Model],
    });

    const x = tf.zeros([224, 224, 3]) as tf.Tensor3D;
    try {
      const predictions = await model.classify(x);
      expect(predictions.length).toBe(5);
    } finally {
      x.dispose();
      model.dispose();
    }
  },
  timeoutMS
);

it(
  "NSFWJS dispose prevents further use",
  async () => {
    const model = await load();
    model.dispose();
    const x = tf.zeros([224, 224, 3]) as tf.Tensor3D;
    try {
      await expect(model.classify(x)).rejects.toThrow("been disposed");
    } finally {
      x.dispose();
    }
  },
  timeoutMS
);
