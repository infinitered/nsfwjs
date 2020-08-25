import { load, predictionType, NSFWJS } from '../src/index'
const fs = require('fs');

// Fix for JEST
const globalAny: any = global
globalAny.fetch = require('node-fetch')
const timeoutMS = 10000

const path = `${__dirname}/../example/manual-testing/data/animations/smile.gif`

const roundPredicitonProbability = ({ className, probability }: predictionType) => {
  return {className, probability: Math.floor(probability * 10000) / 10000}
}

describe('NSFWJS classify GIF', () => {
  let model: NSFWJS
  let buffer: Buffer

  beforeAll(async () => {
    model = await load()
    buffer = fs.readFileSync(path)
  });

  it("Probabilities match", async () => {
      const expectedResults = [
        [
          { className: 'Neutral', probability: 0.8766 },
          { className: 'Porn', probability: 0.091 },
          { className: 'Sexy', probability: 0.0316 }
        ],
        [
          { className: 'Neutral', probability: 0.8995 },
          { className: 'Porn', probability: 0.0511 },
          { className: 'Sexy', probability: 0.0487 }
        ],
        [
          { className: 'Neutral', probability: 0.8541 },
          { className: 'Sexy', probability: 0.1027 },
          { className: 'Porn', probability: 0.0424 }
        ]
      ]

      const predictions = await model.classifyGif(buffer, { topk: 3, fps: 0.4 })
      expect(predictions.length).toBe(3)

      let index = 0
      predictions[index].map((actualObj, id) => {
        expect(roundPredicitonProbability(actualObj)).toEqual(expectedResults[index][id])
      })

      index = 1
      predictions[index].map((actualObj, id) => {
        expect(roundPredicitonProbability(actualObj)).toEqual(expectedResults[index][id])
      })

      index = 2
      predictions[index].map((actualObj, id) => {
        expect(roundPredicitonProbability(actualObj)).toEqual(expectedResults[index][id])
      })
    },
    timeoutMS
  )

  it("0 fps - single frame from the middle", async () => {
      const predictions = await model.classifyGif(buffer, { topk: 3, fps: 0 })
      expect(predictions.length).toBe(1)
    },
    timeoutMS
  )

  // Takes too long
  it.skip("All frames", async () => {
      const predictions = await model.classifyGif(buffer, { topk: 3 })
      expect(predictions.length).toBe(190)
    },
    timeoutMS
  )
})
