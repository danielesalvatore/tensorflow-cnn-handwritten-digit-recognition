import React, {useEffect} from 'react'
import {Container, Row, Col} from 'react-bootstrap'
import * as tfvis from '@tensorflow/tfjs-vis'

import {MnistData} from '../utils/data'
import {showExamples} from '../utils/showExamples'
import {getModel} from '../utils/getModel'
import {train} from '../utils/train'

const data = new MnistData()
const surface = tfvis.visor().surface({name: 'Input Data Examples', tab: 'Input Data'})

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

function App() {
  useEffect(() => {
    async function loadAndShowExamples() {
      await data.load()
      await showExamples({data, surface})
      const model = getModel()
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
        <Col>take a photo - draw</Col>
        <Col>Results</Col>
      </Row>
    </Container>
  )
}

export default App
