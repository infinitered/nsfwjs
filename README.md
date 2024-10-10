<p align="center">
  <img src="https://github.com/infinitered/nsfwjs/raw/master/_art/nsfwjs_logo.jpg" alt="NSFWJS Logo" width="400" />
  <h2 align="center">Client-side indecent content checking</h2>
</p>

[![All Contributors](https://img.shields.io/badge/all_contributors-15-green.svg?style=flat-square)](#contributors)
[![CircleCI](https://dl.circleci.com/status-badge/img/gh/infinitered/nsfwjs/tree/master.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/gh/infinitered/nsfwjs/tree/master)
[![Netlify Status](https://api.netlify.com/api/v1/badges/72d19dc0-d316-4f75-9904-a33d833ff628/deploy-status)](https://app.netlify.com/sites/nsfwjs/deploys)

A simple JavaScript library to help you quickly identify unseemly images; all in the client's browser. NSFWJS isn't perfect, but it's pretty accurate (~90% with small and ~93% with midsized model)... and it's getting more accurate all the time.

Why would this be useful? [Check out the announcement blog post](https://shift.infinite.red/avoid-nightmares-nsfw-js-ab7b176978b1).

<p align="center">
<img src="https://github.com/infinitered/nsfwjs/raw/master/_art/nsfw_demo.gif" alt="demo example" width="800" align="center" />
</p>

## NOTE

If you're trying to access the Cloudfront hosted model and are running into an error, it's likely due to the fact that the model has been moved to a new location. Please take a look at our [Host your own model](#host-your-own-model) section. We will be returning the model after some hotlinkers have been dealt with.

## **Table of Contents**

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->

- [QUICK: How to use the module](#quick-how-to-use-the-module)
- [Library API](#library-api)
  - [`load` the model](#load-the-model)
  - [Caching](#caching)
  - [`classify` an image](#classify-an-image)
- [Production](#production)
- [Install](#install)
  - [Host your own model](#host-your-own-model)
- [Run the Examples](#run-the-examples)
  - [Tensorflow.js in the browser](#tensorflowjs-in-the-browser)
  - [Browserify](#browserify)
  - [React Native](#react-native)
  - [Node JS App](#node-js-app)
  - [NSFW Filter](#nsfw-filter)
- [Learn TensorFlow.js](#learn-tensorflowjs)
- [More!](#more)
  - [Open Source](#open-source)
  - [Need the experts? Hire Infinite Red for your next project](#need-the-experts-hire-infinite-red-for-your-next-project)
- [Contributors](#contributors)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

The library categorizes image probabilities in the following 5 classes:

- `Drawing` - safe for work drawings (including anime)
- `Hentai` - hentai and pornographic drawings
- `Neutral` - safe for work neutral images
- `Porn` - pornographic images, sexual acts
- `Sexy` - sexually explicit images, not pornography

> _The demo is a continuous deployment source - Give it a go: http://nsfwjs.com_

## QUICK: How to use the module

With `async/await` support:

```js
import * as nsfwjs from "nsfwjs";

const img = document.getElementById("img");

// If you want to host models on your own or use different model from the ones available, see the section "Host your own model".
const model = await nsfwjs.load();

// Classify the image
const predictions = await model.classify(img);
console.log("Predictions: ", predictions);
```

Without `async/await` support:

```js
import * as nsfwjs from "nsfwjs";

const img = document.getElementById("img");

// If you want to host models on your own or use different model from the ones available, see the section "Host your own model".
nsfwjs
  .load()
  .then(function (model) {
    // Classify the image
    return model.classify(img);
  })
  .then(function (predictions) {
    console.log("Predictions: ", predictions);
  });
```

## Library API

### `load` the model

Before you can classify any image, you'll need to load the model.

```js
const model = nsfwjs.load(); // Default: "MobileNetV2"
```

You can use the optional first parameter to specify which model you want to use from the three that are bundled together. Defaults to: `"MobileNetV2"`. This supports tree-shaking on supported bundlers like Webpack, so you will only be loading the model you are using.

```js
const model = nsfwjs.load("MobileNetV2Mid"); // "MobileNetV2" | "MobileNetV2Mid" | "InceptionV3"
```

You can also use same parameter and load the model from your website/server, as explained in the [Host your own model](#host-your-own-model) section. Doing so could reduce the bundle size for loading the model by approximately 1.33 times (33%) since you can directly use the binary files instead of the base64 that are bundled with the package. i.e. The `"MobileNetV2"` model bundled into the package is 3.5MB instead of 2.6MB for hosted binary files. This would only make a difference if you are loading the model every time (without [Caching](#caching)) on the client-side browser since on the server-side, you'd only be loading the model once at the server start.

Model MobileNetV2 - [224x224](https://github.com/infinitered/nsfwjs/blob/master/models/mobilenet_v2/)

```js
const model = nsfwjs.load("/path/to/mobilenet_v2/");
```

If you're using a model that needs an image of dimension other than 224x224, you can pass the size in the options parameter.

Model MobileNetV2Mid - [Graph](https://github.com/infinitered/nsfwjs/tree/master/models/mobilenet_v2_mid)

```js
/* You may need to load this model with graph type */
const model = nsfwjs.load("/path/to/mobilenet_v2_mid/", { type: 'graph' });
```

If you're using a graph model, you cannot use the infer method, and you'll need to tell model load that you're dealing with a graph model in options.

Model InceptionV3 - [299x299](https://github.com/infinitered/nsfwjs/tree/master/models/inception_v3)

```js
const model = nsfwjs.load("/path/to/inception_v3/", { size: 299 });
```

### Caching

If you're using in the browser and you'd like to subsequently load from indexed db or local storage (NOTE: model size may be too large for local storage!) you can save the underlying model using the appropriate scheme and load from there.

```js
const initialLoad = await nsfwjs.load(
  "/path/to/different/model/" /*, { ...options }*/
);
await initialLoad.model.save("indexeddb://exampleModel");
const model = await nsfwjs.load("indexeddb://exampleModel" /*, { ...options }*/);
```

**Parameters**

Initial Load:
1. URL or path to folder containing `model.json`.
2. Optional object with size or type property that your model expects.

Subsequent Load:
1. IndexedDB path.
2. Optional object with size or type property that your model expects.


**Returns**

- Ready to use NSFWJS model object
  

**Troubleshooting**

- On the tab where the model is being loaded, inspect element and navigate to the the "Application" tab. On the left pane under the "Storage" section, there is a subsection named "IndexedDB". Here you can view if the model is being saved.
  

### `classify` an image

This function can take any browser-based image elements (`<img>`, `<video>`, `<canvas>`) and returns an array of most likely predictions and their confidence levels.

```js
// Return top 3 guesses (instead of all 5)
const predictions = await model.classify(img, 3);
```

**Parameters**

- Tensor, Image data, Image element, video element, or canvas element to check
- Number of results to return (default all 5)

**Returns**

- Array of objects that contain `className` and `probability`. Array size is determined by the second parameter in the `classify` function.

## Production

Tensorflow.js offers two flags, `enableProdMode` and `enableDebugMode`. If you're going to use NSFWJS in production, be sure to enable prod mode before loading the NSFWJS model.

```js
import * as tf from "@tensorflow/tfjs";
import * as nsfwjs from "nsfwjs";
tf.enableProdMode();
//...
let model = await nsfwjs.load(`${urlToNSFWJSModel}`);
```

**NOTE:** Consider downloading and hosting the model yourself before moving to production as explained in the [Host your own model](#host-your-own-model) section. This could potentially improve the initial load time of the model. Furthermore, consider [Caching](#caching) the model, if you are using it in the browser.

## Install

NSFWJS is powered by TensorFlow.js as a peer dependency. If your project does not already have TFJS you'll need to add it.

```bash
# peer dependency
$ yarn add @tensorflow/tfjs
# install NSFWJS
$ yarn add nsfwjs
```

For script tags include all the bundles as shown [here](#browserify). Then simply access the nsfwjs global variable. This requires that you've already imported TensorFlow.js as well.

### Host your own model

The magic that powers NSFWJS is the [NSFW detection model](https://github.com/gantman/nsfw_model). By default, the models are bundled into this package. But you may want to host the models on your own server to reduce bundle size by loading them as raw binary files or to host your own custom model. If you want to host your own version of [the model files](https://github.com/infinitered/nsfwjs/tree/master/models), you can do so by following the steps below. You can then pass the relative URL to your hosted files in the `load` function along with the `options` if necessary.

Here is how to install the default model on a website:

1. Download the project by either downloading as zip or cloning `git clone https://github.com/infinitered/nsfwjs.git`. **_If downloading as zip does not work use cloning._**
2. Extract the `models` folder from the root of the project and drop it in the `public` directory of your web application to serve them as static files along side your website. (You can host it anywhere such as on a s3 bucket as long as you can access it via URL).
3. Retrieve the URL and put it into `nsfwjs.load()`. For example: `nsfwjs.load(https://yourwebsite.com/models/mobilenet_v2/model.json)`.

## Run the Examples

### Tensorflow.js in the browser

The demo that powers https://nsfwjs.com/ is available in the [`examples/nsfw_demo`](https://github.com/infinitered/nsfwjs/tree/master/examples/nsfw_demo) folder.

To run the demo, run `yarn prep` which will copy the latest code into the demo. After that's done, you can `cd` into the demo folder and run with `yarn start`.

### Browserify

A browserified version using nothing but promises and script tags is available in the [`minimal_demo`](https://github.com/infinitered/nsfwjs/tree/master/examples/minimal_demo) folder.

```js
<script src="/path/to/model/directory/model.min.js"></script>
<script src="/path/to/model/directory/group1-shard1of2.min.js"></script>
<script src="/path/to/model/directory/group1-shard2of2.min.js"></script>
<script src="/path/to/bundle/nsfwjs.min.js"></script>
```

You should host the `nsfwjs.min.js` file and all the model bundles that you want to use alongside your project, and reference them using the `src` attribute in the script tags.

### React Native

The [NSFWJS React Native app](https://github.com/infinitered/nsfwjs-mobile)
![React Native Demo](./_art/nsfwjs-mobile.jpg)

Loads a local copy of the model to reduce network load and utilizes TFJS-React-Native. [Blog Post](https://shift.infinite.red/nsfw-js-for-react-native-a37c9ba45fe9)

### Node JS App

Using NPM, you can also use the model on the server side.

```bash
$ npm install nsfwjs
$ npm install @tensorflow/tfjs-node
```

```javascript
const axios = require("axios"); //you can use any http client
const tf = require("@tensorflow/tfjs-node");
const nsfw = require("nsfwjs");
async function fn() {
  const pic = await axios.get(`link-to-picture`, {
    responseType: "arraybuffer",
  });
  const model = await nsfw.load(); // To load a local model, nsfw.load('file://./path/to/model/')
  // Image must be in tf.tensor3d format
  // you can convert image to tf.tensor3d with tf.node.decodeImage(Uint8Array,channels)
  const image = await tf.node.decodeImage(pic.data, 3);
  const predictions = await model.classify(image);
  image.dispose(); // Tensor memory must be managed explicitly (it is not sufficient to let a tf.Tensor go out of scope for its memory to be released).
  console.log(predictions);
}
fn();
```

Here is another full example of a [multipart/form-data POST using Express](examples/node_demo), supposing you are using JPG format.

```javascript
const express = require("express");
const multer = require("multer");
const jpeg = require("jpeg-js");

const tf = require("@tensorflow/tfjs-node");
const nsfw = require("nsfwjs");

const app = express();
const upload = multer();

let _model;

const convert = async (img) => {
  // Decoded image in UInt8 Byte array
  const image = await jpeg.decode(img, { useTArray: true });

  const numChannels = 3;
  const numPixels = image.width * image.height;
  const values = new Int32Array(numPixels * numChannels);

  for (let i = 0; i < numPixels; i++)
    for (let c = 0; c < numChannels; ++c)
      values[i * numChannels + c] = image.data[i * 4 + c];

  return tf.tensor3d(values, [image.height, image.width, numChannels], "int32");
};

app.post("/nsfw", upload.single("image"), async (req, res) => {
  if (!req.file) res.status(400).send("Missing image multipart/form-data");
  else {
    const image = await convert(req.file.buffer);
    const predictions = await _model.classify(image);
    image.dispose();
    res.json(predictions);
  }
});

const load_model = async () => {
  _model = await nsfw.load();
};

// Keep the model in memory, make sure it's loaded only once
load_model().then(() => app.listen(8080));

// curl --request POST localhost:8080/nsfw --header 'Content-Type: multipart/form-data' --data-binary 'image=@/full/path/to/picture.jpg'
```

You can also use [`lovell/sharp`](https://github.com/lovell/sharp) for preprocessing tasks and more file formats.

### NSFW Filter

[**NSFW Filter**](https://github.com/navendu-pottekkat/nsfw-filter) is a web extension that uses NSFWJS for filtering out NSFW images from your browser.

It is currently available for Chrome and Firefox and is completely open-source.

Check out the project [here](https://github.com/navendu-pottekkat/nsfw-filter).

## Learn TensorFlow.js

Learn how to write your own library like NSFWJS with my O'Reilly book "Learning TensorFlow.js" available on [O'Reilly](https://learning.oreilly.com/library/view/learning-tensorflowjs/9781492090786/) and [Amazon](https://amzn.to/3dR3vpY).

[![Learning TensorFlow.js JavaScript Book Red](_art/red_mockup_top.jpg)](https://amzn.to/3dR3vpY)

## More!

An [FAQ](https://github.com/infinitered/nsfwjs/wiki/FAQ:-NSFW-JS) page is available.

More about NSFWJS and TensorFlow.js - https://youtu.be/uzQwmZwy3yw

The [model was trained in Keras over several days](https://medium.freecodecamp.org/how-to-set-up-nsfw-content-detection-with-machine-learning-229a9725829c) and 60+ Gigs of data. Be sure to [check out the model code](https://github.com/GantMan/nsfw_model) which was trained on data provided by [Alexander Kim's](https://github.com/alexkimxyz) [nsfw_data_scraper](https://github.com/alexkimxyz/nsfw_data_scraper).

### Open Source

NSFWJS, as open source, is free to use and always will be :heart:. It's MIT licensed, and we'll always do our best to help and quickly answer issues. If you'd like to get a hold of us, join our [community slack](http://community.infinite.red).

### Need the experts? Hire Infinite Red for your next project

If your project's calling for the experts in all things React Native, Infinite Red’s here to help! Our experienced team of software engineers have worked with companies like Microsoft, Zoom, and Mercari to bring even some of the most complex projects to life.

Whether it’s running a full project or training a team on React Native, we can help you solve your company’s toughest engineering challenges – and make it a great experience at the same time.
Ready to see how we can work together? [Send us a message](mailto:hello@infinite.red)

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://gantlaborde.com/"><img src="https://avatars0.githubusercontent.com/u/997157?v=4?s=100" width="100px;" alt="Gant Laborde"/><br /><sub><b>Gant Laborde</b></sub></a><br /><a href="#question-GantMan" title="Answering Questions">💬</a> <a href="#blog-GantMan" title="Blogposts">📝</a> <a href="https://github.com/infinitered/nsfwjs/commits?author=GantMan" title="Code">💻</a> <a href="#example-GantMan" title="Examples">💡</a> <a href="#ideas-GantMan" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-GantMan" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/infinitered/nsfwjs/pulls?q=is%3Apr+reviewed-by%3AGantMan" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/infinitered/nsfwjs/commits?author=GantMan" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://jamonholmgren.com"><img src="https://avatars3.githubusercontent.com/u/1479215?v=4?s=100" width="100px;" alt="Jamon Holmgren"/><br /><sub><b>Jamon Holmgren</b></sub></a><br /><a href="https://github.com/infinitered/nsfwjs/commits?author=jamonholmgren" title="Documentation">📖</a> <a href="#ideas-jamonholmgren" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/infinitered/nsfwjs/commits?author=jamonholmgren" title="Code">💻</a> <a href="#content-jamonholmgren" title="Content">🖋</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/mazenchami"><img src="https://avatars.githubusercontent.com/u/9324607?v=4?s=100" width="100px;" alt="Mazen Chami"/><br /><sub><b>Mazen Chami</b></sub></a><br /><a href="https://github.com/infinitered/nsfwjs/commits?author=mazenchami" title="Documentation">📖</a> <a href="https://github.com/infinitered/nsfwjs/commits?author=mazenchami" title="Code">💻</a> <a href="https://github.com/infinitered/nsfwjs/pulls?q=is%3Apr+reviewed-by%3Amazenchami" title="Reviewed Pull Requests">👀</a> <a href="https://github.com/infinitered/nsfwjs/commits?author=mazenchami" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/jstudenski"><img src="https://avatars0.githubusercontent.com/u/7350279?v=4?s=100" width="100px;" alt="Jeff Studenski"/><br /><sub><b>Jeff Studenski</b></sub></a><br /><a href="#design-jstudenski" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/fvonhoven"><img src="https://avatars2.githubusercontent.com/u/10098988?v=4?s=100" width="100px;" alt="Frank von Hoven III"/><br /><sub><b>Frank von Hoven III</b></sub></a><br /><a href="https://github.com/infinitered/nsfwjs/commits?author=fvonhoven" title="Documentation">📖</a> <a href="#ideas-fvonhoven" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/sandeshsoni"><img src="https://avatars3.githubusercontent.com/u/3761745?v=4?s=100" width="100px;" alt="Sandesh Soni"/><br /><sub><b>Sandesh Soni</b></sub></a><br /><a href="https://github.com/infinitered/nsfwjs/commits?author=sandeshsoni" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/seannam1218"><img src="https://avatars1.githubusercontent.com/u/24437898?v=4?s=100" width="100px;" alt="Sean Nam"/><br /><sub><b>Sean Nam</b></sub></a><br /><a href="https://github.com/infinitered/nsfwjs/commits?author=seannam1218" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/emer7"><img src="https://avatars1.githubusercontent.com/u/21377166?v=4?s=100" width="100px;" alt="Gilbert Emerson"/><br /><sub><b>Gilbert Emerson</b></sub></a><br /><a href="https://github.com/infinitered/nsfwjs/commits?author=emer7" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/xilaraux"><img src="https://avatars2.githubusercontent.com/u/17703730?v=4?s=100" width="100px;" alt="Oleksandr Kozlov"/><br /><sub><b>Oleksandr Kozlov</b></sub></a><br /><a href="#infra-xilaraux" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/infinitered/nsfwjs/commits?author=xilaraux" title="Tests">⚠️</a> <a href="https://github.com/infinitered/nsfwjs/commits?author=xilaraux" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://morganlaco.com"><img src="https://avatars2.githubusercontent.com/u/4466642?v=4?s=100" width="100px;" alt="Morgan"/><br /><sub><b>Morgan</b></sub></a><br /><a href="https://github.com/infinitered/nsfwjs/commits?author=mlaco" title="Code">💻</a> <a href="#ideas-mlaco" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://mycaule.github.io/"><img src="https://avatars2.githubusercontent.com/u/6161385?v=4?s=100" width="100px;" alt="Michel Hua"/><br /><sub><b>Michel Hua</b></sub></a><br /><a href="https://github.com/infinitered/nsfwjs/commits?author=mycaule" title="Code">💻</a> <a href="https://github.com/infinitered/nsfwjs/commits?author=mycaule" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://www.infinite.red"><img src="https://avatars2.githubusercontent.com/u/1771152?v=4?s=100" width="100px;" alt="Kevin VanGelder"/><br /><sub><b>Kevin VanGelder</b></sub></a><br /><a href="https://github.com/infinitered/nsfwjs/commits?author=kevinvangelder" title="Code">💻</a> <a href="https://github.com/infinitered/nsfwjs/commits?author=kevinvangelder" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://technikempire.com"><img src="https://avatars2.githubusercontent.com/u/11234763?v=4?s=100" width="100px;" alt="Jesse Nicholson"/><br /><sub><b>Jesse Nicholson</b></sub></a><br /><a href="#data-TechnikEmpire" title="Data">🔣</a> <a href="#ideas-TechnikEmpire" title="Ideas, Planning, & Feedback">🤔</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/camhart"><img src="https://avatars0.githubusercontent.com/u/3038809?v=4?s=100" width="100px;" alt="camhart"/><br /><sub><b>camhart</b></sub></a><br /><a href="https://github.com/infinitered/nsfwjs/commits?author=camhart" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/Cameron-Burkholder"><img src="https://avatars2.githubusercontent.com/u/13265710?v=4?s=100" width="100px;" alt="Cameron Burkholder"/><br /><sub><b>Cameron Burkholder</b></sub></a><br /><a href="#design-Cameron-Burkholder" title="Design">🎨</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://qwertyforce.ru"><img src="https://avatars0.githubusercontent.com/u/44163887?v=4?s=100" width="100px;" alt="qwertyforce"/><br /><sub><b>qwertyforce</b></sub></a><br /><a href="https://github.com/infinitered/nsfwjs/commits?author=qwertyforce" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/YegorZaremba"><img src="https://avatars3.githubusercontent.com/u/31797554?v=4?s=100" width="100px;" alt="Yegor <3"/><br /><sub><b>Yegor <3</b></sub></a><br /><a href="https://github.com/infinitered/nsfwjs/commits?author=YegorZaremba" title="Code">💻</a> <a href="https://github.com/infinitered/nsfwjs/commits?author=YegorZaremba" title="Tests">⚠️</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://navendu.me"><img src="https://avatars1.githubusercontent.com/u/49474499?v=4?s=100" width="100px;" alt="Navendu Pottekkat"/><br /><sub><b>Navendu Pottekkat</b></sub></a><br /><a href="https://github.com/infinitered/nsfwjs/commits?author=navendu-pottekkat" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/VladStepanov"><img src="https://avatars0.githubusercontent.com/u/49880862?v=4?s=100" width="100px;" alt="Vladislav"/><br /><sub><b>Vladislav</b></sub></a><br /><a href="https://github.com/infinitered/nsfwjs/commits?author=VladStepanov" title="Code">💻</a> <a href="https://github.com/infinitered/nsfwjs/commits?author=VladStepanov" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/nacht42"><img src="https://avatars1.githubusercontent.com/u/37903575?v=4?s=100" width="100px;" alt="Nacht"/><br /><sub><b>Nacht</b></sub></a><br /><a href="https://github.com/infinitered/nsfwjs/commits?author=nacht42" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/kateinkim"><img src="https://avatars.githubusercontent.com/u/53795920?v=4?s=100" width="100px;" alt="kateinkim"/><br /><sub><b>kateinkim</b></sub></a><br /><a href="https://github.com/infinitered/nsfwjs/commits?author=kateinkim" title="Code">💻</a> <a href="https://github.com/infinitered/nsfwjs/commits?author=kateinkim" title="Documentation">📖</a></td>
    </tr>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://janpoonthong.github.io/portfolio/"><img src="https://avatars.githubusercontent.com/u/56725335?v=4?s=100" width="100px;" alt="jan"/><br /><sub><b>jan</b></sub></a><br /><a href="https://github.com/infinitered/nsfwjs/commits?author=JanPoonthong" title="Documentation">📖</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/roerohan"><img src="https://avatars.githubusercontent.com/u/42958812?v=4?s=100" width="100px;" alt="Rohan Mukherjee"/><br /><sub><b>Rohan Mukherjee</b></sub></a><br /><a href="#question-roerohan" title="Answering Questions">💬</a> <a href="#infra-roerohan" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#maintenance-roerohan" title="Maintenance">🚧</a> <a href="https://github.com/infinitered/nsfwjs/commits?author=roerohan" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="https://hazya.dev"><img src="https://avatars.githubusercontent.com/u/63403456?v=4?s=100" width="100px;" alt="Hasitha Wickramasinghe"/><br /><sub><b>Hasitha Wickramasinghe</b></sub></a><br /><a href="https://github.com/infinitered/nsfwjs/commits?author=haZya" title="Code">💻</a> <a href="https://github.com/infinitered/nsfwjs/commits?author=haZya" title="Documentation">📖</a> <a href="#example-haZya" title="Examples">💡</a> <a href="#ideas-haZya" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-haZya" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="https://github.com/infinitered/nsfwjs/commits?author=haZya" title="Tests">⚠️</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
