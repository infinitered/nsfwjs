<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Simple Node.js NSFWJS demo](#simple-nodejs-nsfwjs-demo)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

# Simple Node.js NSFWJS demo

This is a tiny Express server example that loads NSFWJS once and exposes a `POST /nsfw` endpoint for image classification.

From the repo root:

```bash
yarn build
yarn --cwd examples/node_demo install
yarn --cwd examples/node_demo start
```

Send an image with `multipart/form-data` using the `image` field:

```bash
curl -X POST http://localhost:8080/nsfw \
  -F "image=@/path/to/image.jpg"
```

The server responds with NSFWJS predictions as JSON.
