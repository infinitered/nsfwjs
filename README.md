<p align="center">
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors)
  <img src="https://github.com/infinitered/nsfwjs/raw/master/_art/nsfwjs_logo.jpg" alt="NSFWJS Logo" width="400" />
  <h2 align="center">Client-side indecent content checking</h2>
</p>

A simple JavaScript library to help you quickly identify unseemly images; all in the client's browser. NSFWJS isn't perfect, but it's pretty accurate (~90% from our test set of 15,000 test images)... and it's getting more accurate all the time.

Why would this be useful?  [Check out the announcement blog post](https://shift.infinite.red/avoid-nightmares-nsfw-js-ab7b176978b1).

<p align="center">
<img src="https://github.com/infinitered/nsfwjs/raw/master/_art/nsfw_demo.gif" alt="demo example" width="800" align="center" />
</p>

The library categorizes image probabilities in the following 5 classes:

- `Drawing` - safe for work drawings (including anime)
- `Hentai` - hentai and pornographic drawings
- `Neutral` - safe for work neutral images
- `Porn` - pornographic images, sexual acts
- `Sexy` - sexually explicit images, not pornography

The demo is a continuous deployment source - Give it a go: http://nsfwjs.com/

## How to use the module

With `async/await` support:

```js
import * as nsfwjs from 'nsfwjs'

const img = document.getElementById('img')

// Load model from my S3.
// See the section hosting the model files on your site.
const model = await nsfwjs.load()

// Classify the image
const predictions = await model.classify(img)
console.log('Predictions: ', predictions)
```

Without `async/await` support:

```js
import * as nsfwjs from 'nsfwjs'

const img = document.getElementById('img')

// Load model from my S3.
// See the section hosting the model files on your site.
nsfwjs.load().then(function (model) {
  model.classify(img).then(function (predictions) {
    // Classify the image
    console.log('Predictions: ', predictions)
  })
})
```

## API

#### `load` the model

Before you can classify any images, you'll need to load the model. For many reasons, you should use the optional parameter and load the model from your website. Review how in the install directions.

```js
const model = nsfwjs.load('/path/to/model/directory/')
```

**Parameters**

- optional URL to the `model.json`

**Returns**

- Ready to use NSFWJS model object

#### `classify` an image

This function can take any browser-based image elements (<img>, <video>, <canvas>) and return an array of most likely predictions and their confidence levels.

```js
// Return top 3 guesses (instead of all 5)
const predictions = await model.classify(img, 3)
```

**Parameters**

- Tensor, Image data, Image element, video element, or canvas element to check
- Number of results to return (default all 5)

**Returns**

- Array of objects that contain `className` and `probability`. Array size is determined by the second parameter in the `classify` function.

## Install

NSFWJS is powered by Tensorflow.JS as a peer dependency. If your project does not already have TFJS you'll need to add it.

```bash
# peer dependency
$ yarn add @tensorflow/tfjs
# install NSFWJS
$ yarn add nsfwjs
```

#### Host your own model

The magic that powers NSFWJS is the [NSFW detection model](https://github.com/gantman/nsfw_model). By default, this node module is pulling from my S3, but I make no guarantees that I'll keep that download link available forever. It's best for the longevity of your project that you download and host your own version of [the model files](https://github.com/infinitered/nsfwjs/tree/master/example/nsfw_demo/public/model). You can then pass the relative URL to your hosted files in the `load` function. If you can come up with a way to bundle the model into the NPM package, I'd love to see a PR to this repo!

## Run the Example

The demo that powers https://nsfwjs.com/ is available in the example folder.

To run the demo, run `yarn prep` which will copy the latest code into the demo. After that's done, you can `cd` into the demo folder and run with `yarn start`.

## More!

The model was trained in Keras over several days and 60+ Gigs of data. Be sure to [check out the model code](https://github.com/GantMan/nsfw_model) which was trained on data provided by [Alexander Kim's](https://github.com/alexkimxyz) [nsfw_data_scraper](https://github.com/alexkimxyz/nsfw_data_scraper).

#### Open Source

NSFWJS, as open source, is free to use and always will be :heart:. It's MIT licensed, and we'll always do our best to help and quickly answer issues. If you'd like to get a hold of us, join our [community slack](http://community.infinite.red).

#### Premium

[Infinite Red](https://infinite.red/) offers premium training and support. Email us at [hello@infinite.red](mailto:hello@infinite.red) to get in touch.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore -->
<table><tr><td align="center"><a href="http://gantlaborde.com/"><img src="https://avatars0.githubusercontent.com/u/997157?v=4" width="100px;" alt="Gant Laborde"/><br /><sub><b>Gant Laborde</b></sub></a><br /><a href="#question-GantMan" title="Answering Questions">💬</a> <a href="#blog-GantMan" title="Blogposts">📝</a> <a href="https://github.com/infinitered/nsfwjs/commits?author=GantMan" title="Code">💻</a> <a href="#design-GantMan" title="Design">🎨</a> <a href="https://github.com/infinitered/nsfwjs/commits?author=GantMan" title="Documentation">📖</a> <a href="#example-GantMan" title="Examples">💡</a> <a href="#ideas-GantMan" title="Ideas, Planning, & Feedback">🤔</a> <a href="#infra-GantMan" title="Infrastructure (Hosting, Build-Tools, etc)">🚇</a> <a href="#review-GantMan" title="Reviewed Pull Requests">👀</a> <a href="#talk-GantMan" title="Talks">📢</a> <a href="https://github.com/infinitered/nsfwjs/commits?author=GantMan" title="Tests">⚠️</a></td><td align="center"><a href="https://jamonholmgren.com"><img src="https://avatars3.githubusercontent.com/u/1479215?v=4" width="100px;" alt="Jamon Holmgren"/><br /><sub><b>Jamon Holmgren</b></sub></a><br /><a href="https://github.com/infinitered/nsfwjs/commits?author=jamonholmgren" title="Documentation">📖</a></td></tr></table>

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!