import React, {Component} from 'react'
import {ButtonToolbar, Button} from 'react-bootstrap'
import CanvasDraw from 'react-canvas-draw'

export default class MyCanvasDraw extends Component {
  state = {}

  onClearBtnClick() {
    this.saveableCanvas.clear()
  }
  onUndoBtnClick() {
    this.saveableCanvas.undo()
  }
  onGuessBtnClick() {
    const {model, predict} = this.props

    if (model && predict) {
      predict(model, this.saveableCanvas.canvasContainer.children[1])
    }
    // const img = this.saveableCanvas.canvasContainer.children[1].toDataURL()
    // this.setState({
    //   img,
    // })
  }

  componentDidMount() {
    this.interval = setInterval(this.onGuessBtnClick.bind(this), 5000)
  }

  componentWillUnmount() {
    // Clear the interval right before component unmount
    clearInterval(this.interval)
  }

  render() {
    const {img} = this.state
    return (
      <>
        <ButtonToolbar>
          <Button variant="outline-info" onClick={this.onUndoBtnClick.bind(this)}>
            Undo
          </Button>
          <Button variant="outline-danger" onClick={this.onClearBtnClick.bind(this)}>
            Clear
          </Button>
        </ButtonToolbar>
        <CanvasDraw
          canvasWidth="400px"
          canvasHeight="400px"
          ref={canvasDraw => (this.saveableCanvas = canvasDraw)}
          style={{
            boxShadow:
              '0 13px 27px -5px rgba(50, 50, 93, 0.25),    0 8px 16px -8px rgba(0, 0, 0, 0.3)',
          }}
        />

        {img && <img src={img} alt="number to guess" />}
      </>
    )
  }
}
