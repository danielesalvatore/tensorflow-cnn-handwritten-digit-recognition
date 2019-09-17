import React, {useEffect} from 'react'
import {Container, Row, Col} from 'react-bootstrap'
import * as tfvis from '@tensorflow/tfjs-vis'
import * as tf from '@tensorflow/tfjs'
import CanvasDraw from '../CanvasDraw'
import {Image} from 'image-js'

import {MnistData} from '../utils/data'
import {showExamples} from '../utils/showExamples'
import {getModel} from '../utils/getModel'
import {train} from '../utils/train'

const data = new MnistData()

const classNames = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine']

function doPrediction(model, data, testDataSize = 500) {
  const IMAGE_WIDTH = 28
  const IMAGE_HEIGHT = 28
  const testData = data.nextTestBatch(testDataSize)
  const testxs = testData.xs.reshape([testDataSize, IMAGE_WIDTH, IMAGE_HEIGHT, 1])
  const labels = testData.labels.argMax([-1])
  const preds = model.predict(testxs).argMax([-1])

  testxs.dispose()
  return [preds, labels]
}

async function showAccuracy(model, data) {
  const [preds, labels] = doPrediction(model, data)
  const classAccuracy = await tfvis.metrics.perClassAccuracy(labels, preds)
  const container = {name: 'Accuracy', tab: 'Evaluation'}
  tfvis.show.perClassAccuracy(container, classAccuracy, classNames)

  labels.dispose()
}

async function showConfusion(model, data) {
  const [preds, labels] = doPrediction(model, data)
  const confusionMatrix = await tfvis.metrics.confusionMatrix(labels, preds)
  const container = {name: 'Confusion Matrix', tab: 'Evaluation'}
  tfvis.render.confusionMatrix(container, {values: confusionMatrix}, classNames)

  labels.dispose()
}

function toBlackAndWhite(image) {
  var canvas = document.createElement('canvas')
  var ctx = canvas.getContext('2d')

  canvas.width = image.width
  canvas.height = image.height

  ctx.drawImage(image, 0, 0)

  var imageData = ctx.getImageData(0, 0, image.width, image.height)

  for (var i = 0; i < imageData.data.length; i += 4) {
    var avg = (imageData.data[i] + imageData.data[i + 1] + imageData.data[i + 2]) / 3

    imageData.data[i] = avg
    imageData.data[i + 1] = avg
    imageData.data[i + 2] = avg
  }

  ctx.putImageData(imageData, 0, 0, 0, 0, imageData.width, imageData.height)

  return canvas
}

function convertBlock(incomingData) {
  // incoming data is a UInt8Array
  var i,
    l = incomingData.length
  var outputData = new Float32Array(incomingData.length)
  for (i = 0; i < l; i++) {
    outputData[i] = (incomingData[i] - 128) / 128.0
  }
  return outputData
}

async function predict(model, canvas, testDataSize = 500) {
  const IMAGE_WIDTH = 28
  const IMAGE_HEIGHT = 28
  const IMAGE_SIZE = 784
  const TRAIN_DATA_SIZE = 5500
  const TEST_DATA_SIZE = 1000

  const myimg = await Image.fromCanvas(canvas)
  let grey = myimg.grey().resize({width: 28, height: 28})
  //let bufferUint8 = grey.toBuffer()
  const tensor = tf.tensor2d(grey.data, [1, IMAGE_SIZE])
  const xs = tensor.reshape([1, 28, 28, 1])
  const preds = model.predict(xs).argMax([-1])

  preds.print()

  return

  const img = tf.browser.fromPixels(canvas)
  console.log(img)
  const smalImg = tf.image.resizeBilinear(img, [IMAGE_WIDTH, IMAGE_HEIGHT])
  console.log(smalImg)
  const testxs = smalImg.reshape([1, IMAGE_WIDTH, IMAGE_HEIGHT, 1])
  console.log(testxs)

  // console.log('original', img.shape, img.size, img)
  // const smalIm1g = tf.image.resizeBilinear(img, [IMAGE_WIDTH, IMAGE_HEIGHT])
  // console.log('smalIm1g', smalIm1g.shape, smalIm1g.size)

  // const smalImg = tf.reshape(smalIm1g, [IMAGE_WIDTH, IMAGE_HEIGHT, 3])
  // console.log('smalImg', smalImg.shape, smalImg.size)

  //const resized = tf.cast(smalImg, 'float32')
  //console.log('casted', resized.shape, resized.size)
  //const t4d = tf.tensor4d(Array.from(resized.dataSync()), [1, IMAGE_WIDTH, IMAGE_HEIGHT, 1])
  //const testxs = tf.image.resizeBilinear(img, [IMAGE_WIDTH, IMAGE_HEIGHT])
  //const resized = tf.cast(img, 'float32')
  //console.log({resized})
  //const reshaped = resized.reshape([testDataSize, IMAGE_WIDTH, IMAGE_HEIGHT, 1])
  //console.log(t4d)
  //const preds = model.predict(testxs).argMax([-1])

  console.log(preds)
  //testxs.dispose()
  return [preds]
}

function App() {
  const model = getModel()
  useEffect(() => {
    async function loadAndShowExamples() {
      const surface = tfvis.visor().surface({name: 'Input Data Examples', tab: 'Input Data'})

      await data.load()

      await showExamples({data, surface})

      tfvis.show.modelSummary({name: 'Model Architecture'}, model)

      await train(model, data)
      await showAccuracy(model, data)
      await showConfusion(model, data)
    }
    loadAndShowExamples()
  }, [])

  return (
    <Container>
      <Row>
        <Col>
          <h1>Draw a number</h1>
          <CanvasDraw predict={predict} model={model} />
        </Col>
        <Col>
          <h1>ML will recognize it!</h1>
          Results
        </Col>
      </Row>
    </Container>
  )
}

export default App
