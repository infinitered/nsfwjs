import React, { Component } from 'react'
import logo from './logo.svg'
import './App.css'
import * as nsfwjs from 'nsfwjs'
import Dropzone from 'react-dropzone'
import Webcam from 'react-webcam'

// components
import Underdrop from './components/Underdrop'
import Loading from './components/Loading'
import Header from './components/Header'
import Footer from './components/Footer'
import Results from './components/Results'

const blurred = { filter: 'blur(30px)', WebkitFilter: 'blur(30px)' }
const clean = {}
const loadingMessage = 'Loading NSFWJS Model'
const dragMessage = 'Drag and drop an image to check'
const camMessage = 'Cam active'
const DETECTION_PERIOD = 1000

class App extends Component {
  state = {
    model: null,
    graphic: logo,
    titleMessage: 'Please hold, the model is loading...',
    message: loadingMessage,
    predictions: [],
    droppedImageStyle: { opacity: 0.4 },
    blurNSFW: true,
    enableWebcam: false,
    loading: true,
    fileType: null
  }

  componentDidMount() {
    // Load model from public
    nsfwjs.load('/model/').then(model => {
      this.setState({
        model,
        titleMessage: dragMessage,
        message: 'Ready to Classify',
        loading: false
      })
    })
  }

  _refWeb = webcam => {
    this.webcam = webcam
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
    if (this.state.fileType === 'image/gif') {
      this.setState({
        message: `0% - Chopping up GIF`,
        predictions: []
      })
      const predictions = await this.state.model.classifyGif(img, {
        topk: 1,
        onFrame: ({ index, totalFrames, predictions }) => {
          const percent = ((index / totalFrames) * 100).toFixed(0)
          this.setState({
            message: `${percent}% - Frame ${index} is ${
              predictions[0].className
            }`
          })
        }
      })
    } else {
      const predictions = await this.state.model.classify(img)
      let droppedImageStyle = this.detectBlurStatus(predictions[0].className)
      this.setState({
        message: `Identified as ${predictions[0].className}`,
        predictions,
        droppedImageStyle
      })
    }
  }

  setFile = file => {
    // drag and dropped
    const reader = new FileReader()
    reader.onload = e => {
      this.setState(
        { graphic: e.target.result, fileType: file.type },
        this.checkContent
      )
    }

    reader.readAsDataURL(file)
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

  detectWebcam = async () => {
    await this.sleep(100)

    const video = document.querySelectorAll('.captureCam')
    // assure video is still shown
    if (video[0]) {
      const predictions = await this.state.model.classify(video[0])
      let droppedImageStyle = this.detectBlurStatus(predictions[0].className)
      this.setState({
        message: `Identified as ${predictions[0].className}`,
        predictions,
        droppedImageStyle
      })
      setTimeout(this.detectWebcam, DETECTION_PERIOD)
    }
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

  _renderInterface = () => {
    const maxWidth = window.innerWidth
    const maxHeight = window.innerHeight

    const videoConstraints = {
      width: { ideal: maxWidth, max: maxWidth },
      height: { ideal: maxHeight, max: maxHeight },
      facingMode: 'environment'
    }
    if (this.state.enableWebcam) {
      return (
        <Webcam
          id="capCam"
          className="captureCam"
          style={this.state.droppedImageStyle}
          width={maxWidth}
          audio={false}
          ref={this._refWeb}
          videoConstraints={videoConstraints}
        />
      )
    } else {
      return (
        <Dropzone
          id="dropBox"
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
      )
    }
  }

  _camChange = e => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      window.alert("Sorry, your browser doesn't seem to support camera access.")
      return
    }
    this.detectWebcam()
    this.setState({
      enableWebcam: !this.state.enableWebcam,
      predictions: [],
      droppedImageStyle: {},
      titleMessage: this.state.enableWebcam ? dragMessage : camMessage
    })
  }

  render() {
    return (
      <div className="App">
        <Header />
        <main>
          <div>
            <div id="overDrop">
              <p id="topMessage">{this.state.titleMessage}</p>
            </div>
            {this._renderInterface()}
            <Underdrop
              camChange={this._camChange}
              camStatus={this.state.enableWebcam}
              blurChange={this.blurChange}
              blurStatus={this.state.blurNSFW}
            />
          </div>
          <Loading showLoading={this.state.loading} />
          <Results
            message={this.state.message}
            predictions={this.state.predictions}
          />
        </main>
        <Footer />
      </div>
    )
  }
}

export default App
