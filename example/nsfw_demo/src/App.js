import React, { Component } from 'react'
import logo from './logo.svg'
import ir from './ir.svg'
import tflogo from './tflogo.jpg'
import './App.css'
import * as nsfwjs from 'nsfwjs'
import Dropzone from 'react-dropzone'
import Switch from 'react-switch'
import * as Spinner from 'react-spinkit'

const blurred = { filter: 'blur(30px)', WebkitFilter: 'blur(30px)' }
const clean = {}
const loadingMessage = 'Loading NSFWJS Model'

class App extends Component {
  state = {
    model: null,
    graphic: logo,
    titleMessage: 'Please hold, the model is loading...',
    message: loadingMessage,
    predictions: [],
    droppedImageStyle: { opacity: 0.4 },
    blurNSFW: true
  }
  componentDidMount() {
    // Load model from public
    nsfwjs.load('/model/').then(model => {
      this.setState({
        model,
        titleMessage: 'Drag and drop an image to check',
        message: 'Ready to Classify'
      })
    })
  }

  // terrible race condition fix :'(
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  detectBlurStatus = (className, blurNSFW = this.state.blurNSFW) => {
    let droppedImageStyle = clean
    if (blurNSFW) {
      switch (className) {
        case 'Hentai':
        case 'Porn':
        case 'Sexy':
          droppedImageStyle = blurred
      }
    }
    return droppedImageStyle
  }

  checkContent = async () => {
    // Sleep bc it's grabbing image before it's rendered
    // Not really a problem of this library
    await this.sleep(100)
    const img = this.refs.dropped
    const predictions = await this.state.model.classify(img)
    let droppedImageStyle = this.detectBlurStatus(predictions[0].className)
    this.setState({
      message: `Identified as ${predictions[0].className}`,
      predictions,
      droppedImageStyle
    })
  }

  setFile = file => {
    if (typeof file === 'string') {
      // using a sample
      this.setState({ graphic: file }, this.checkContent)
    } else {
      // drag and dropped
      const reader = new FileReader()
      reader.onload = e => {
        this.setState({ graphic: e.target.result }, this.checkContent)
      }

      reader.readAsDataURL(file)
    }
  }

  onDrop = (accepted, rejected) => {
    if (rejected.length > 0) {
      window.alert('JPG, PNG, GIF only plz')
    } else {
      let droppedImageStyle = this.state.blurNSFW ? blurred : clean
      this.setState({
        message: 'Processing...',
        droppedImageStyle
      })
      this.setFile(accepted[0])
    }
  }

  _renderPredictions = () => {
    return (
      <div id="predictions">
        <ul>
          {this.state.predictions.map(prediction => (
            <li>
              {prediction.className} -{' '}
              {(prediction.probability * 100).toFixed(2)}%
            </li>
          ))}
        </ul>
      </div>
    )
  }

  blurChange = checked => {
    // Check on blurring
    let droppedImageStyle = clean
    if (this.state.predictions.length > 0) {
      droppedImageStyle = this.detectBlurStatus(
        this.state.predictions[0].className,
        checked
      )
    }

    this.setState({
      blurNSFW: checked,
      droppedImageStyle
    })
  }

  _renderSpinner = () => {
    if (this.state.message === loadingMessage) {
      return (
        <div id="spinContainer">
          <Spinner name="cube-grid" color="#e79f23" id="processCube" />
        </div>
      )
    }
  }

  render() {
    return (
      <div className="App">
        <div className="menu">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>Client-side indecent content checking</h1>
          <div className="snippet">
            <p>Powered by</p>
            <a href="https://js.tensorflow.org/" targe="_blank">
              <img src={tflogo} id="tflogo" alt="TensorflowJS Logo" />
            </a>
          </div>
        </div>
        <header className="App-header">
          <p>{this.state.titleMessage}</p>
          <div>
            <Dropzone
              accept="image/jpeg, image/png, image/gif"
              className="photo-box"
              onDrop={this.onDrop.bind(this)}
            >
              <img
                src={this.state.graphic}
                style={this.state.droppedImageStyle}
                alt="drop your file here"
                className="dropped-photo"
                ref="dropped"
              />
            </Dropzone>

            <div id="switchStation">
              <p>Blur Protection</p>
              <Switch
                onColor="#e79f23"
                offColor="#000"
                onChange={this.blurChange}
                checked={this.state.blurNSFW}
              />
            </div>
          </div>
          {this._renderSpinner()}
          <div id="results">
            <p>{this.state.message}</p>
            {this._renderPredictions()}
          </div>
        </header>
        <footer>
          <ul>
            <li>Copyright Now(ish)</li>
            <li>
              <a href="https://github.com/infinitered/nsfwjs">NSFWJS GitHub</a>
            </li>
            <li>
              <a href="https://github.com/gantman/nsfw_model">Model Repo</a>
            </li>
            <li>
              <a href="https://infinite.red">
                <img src={ir} alt="infinite red logo" />
              </a>
            </li>
          </ul>
        </footer>
      </div>
    )
  }
}

export default App
