import * as tf from '@tensorflow/tfjs'
import { load } from '../src/index'

// Fix for JEST
const globalAny: any = global
globalAny.fetch = require('node-fetch')
const timeoutMS = 10000

it(
  "NSFWJS classify doesn't leak",
  async () => {
    const model = await load()
    const x = tf.zeros([224, 224, 3]) as tf.Tensor3D
    const numTensorsBefore = tf.memory().numTensors
    await model.classify(x)
    expect(tf.memory().numTensors).toBe(numTensorsBefore)
  },
  timeoutMS
)

it(
  "NSFWJS infer doesn't leak",
  async () => {
    const model = await load()
    const x = tf.zeros([224, 224, 3]) as tf.Tensor3D
    const numTensorsBefore = tf.memory().numTensors
    model.infer(x)
    expect(tf.memory().numTensors).toBe(numTensorsBefore + 1)
  },
  timeoutMS
)
