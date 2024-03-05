import * as tf from "@tensorflow/tfjs";
import { ModelName, load } from "../src/index";

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
    expect(consoleInfoSpy).toBeCalledWith(
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
    expect(consoleInfoSpy).toBeCalledWith(
      `%cYou're using the model: '${modelOrUrl}'. See NSFWJS docs for instructions on hosting your own model (https://github.com/infinitered/nsfwjs?tab=readme-ov-file#host-your-own-model).`,
      "color: lightblue"
    );
  },
  timeoutMS
);
