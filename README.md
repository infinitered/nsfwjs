<img src="https://github.com/infinitered/nsfwjs/raw/master/_art/nsfwjs_logo.jpg" alt="NSFWJS Logo" width="500" />

## Client-side indecent content checking

NSFWJS isn't perfect, but it's pretty accurate. And it's getting more accurate all the time.

Give it a go: http://nsfwjs.com/

## How to use

```js
import * as nsfwjs from 'nsfwjs'

const img = document.getElementById('img')

// Load the model.  This pulls from my S3
// please only use this for testing
// See the section on setting up your own model for details
const model = await nsfwjs.load()

// Classify the image
const predictions = await model.classify(img)
console.log('Predictions: ', predictions)
```

### Run the Example

The demo that powers https://nsfwjs.com/ is available in the example folder.

To run the demo, run `yarn prep` which will copy the latest code into the demo.  After that's done, you can `cd` into the demo folder and run with `yarn start`.

