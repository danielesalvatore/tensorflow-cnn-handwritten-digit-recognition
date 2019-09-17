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
  async onGuessBtnClick() {
    const {model, predict} = this.props

    if (model && predict) {
      const canvas = this.saveableCanvas.canvasContainer.children[1]
      const r = await predict(model, canvas)
      if (r.img) {
        this.setState({
          img: r.img,
        })
      }
    }
  }

  componentDidMount() {
    const canvas = this.saveableCanvas.canvasContainer.children[1]
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'blue'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
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
          //hideGrid={true}
          brushColor="#FFFFFF"
          backgroundColor="#000"
          catenaryColor="#e0e0e0"
          style={{
            boxShadow:
              '0 13px 27px -5px rgba(50, 50, 93, 0.25),    0 8px 16px -8px rgba(0, 0, 0, 0.3)',
          }}
        />

        {img && <img src={img.toDataURL()} alt="number to guess" />}
      </>
    )
  }
}
