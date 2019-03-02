import React, { Component } from 'react'
import logo from './logo.svg'
import ir from './ir.svg'
import tflogo from './tflogo.jpg'
import './App.css'
import * as nsfwjs from 'nsfwjs'
import Dropzone from 'react-dropzone'
import Switch from 'react-switch'
import * as Spinner from 'react-spinkit'
import Drop from 'tether-drop'
import Webcam from 'react-webcam'

const blurred = { filter: 'blur(30px)', WebkitFilter: 'blur(30px)' }
const clean = {}
const loadingMessage = 'Loading NSFWJS Model'
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
  }
  componentDidMount() {
    // hovercard
    this.drop = new Drop({
      target: this.hoverTarget,
      content: this.hoverContent,
      position: 'bottom left',
      openOn: 'click',
      constrainToWindow: true,
      constrainToScrollParent: true,
      remove: true
    })

    // Load model from public
    nsfwjs.load('/model/').then(model => {
      this.setState(
        {
          model,
          titleMessage: 'Drag and drop an image to check',
          message: 'Ready to Classify'
        }
      )
    })
  }

  _refTarget = ref => {
    this.hoverTarget = ref
  }

  _refContent = ref => {
    this.hoverContent = ref
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
            <li id={prediction.className}>
              {prediction.className} -{' '}
              {(prediction.probability * 100).toFixed(2)}%
            </li>
          ))}
        </ul>
      </div>
    )
  }

  detectWebcam = async () => {
    await this.sleep(100)

    const video = document.querySelectorAll('.captureCam')

    if (video[0]){
      const predictions = await this.state.model.classify(video[0])
      console.log('preds : ', predictions)
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

  _renderSpinner = () => {
    if (this.state.message === loadingMessage) {
      return (
        <div id="spinContainer">
        <Spinner name="cube-grid" color="#e79f23" id="processCube" />
        </div>
      )
    }
  }

  _renderWebcam = (showCamflag = this.state.enableWebcam) =>{
    const maxWidth = window.innerWidth
    const maxHeight = window.innerHeight

    const videoConstraints = {
      width: { ideal: maxWidth, max: maxWidth },
      height: { ideal: maxHeight, max: maxHeight },
      facingMode: 'environment'
    }
    if (showCamflag) {
      this.detectWebcam()
      return(
        <Webcam
        className="captureCam"
        width={maxWidth}
        audio={false}
        ref={this._refWeb}
        videoConstraints={videoConstraints}
        /> )}
    else {
      return(
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
      )}
  }

  render() {

    return (
      <div className="App">
        <header>
          <img src={logo} className="App-logo" alt="logo" />
          <h1>Client-side indecent content checking</h1>
          <div className="snippet">
            <p>Powered by</p>
            <a href="https://js.tensorflow.org/" targe="_blank">
              <img src={tflogo} id="tflogo" alt="TensorflowJS Logo" />
            </a>
          </div>
        </header>
        <main>
          <p> webcam </p>
          <button name="enable cam" onClick={ e => { console.log('btn clicked');
                                                       this.setState({enableWebcam: !this.state.enableWebcam, predictions: []}) }}>
            Toggle Cam</button>
          <p id="topMessage">{this.state.titleMessage}</p>
            { this._renderWebcam() }

          <div>
            <div id="underDrop">
              <div ref={this._refTarget} className="clickTarget">
                False Positive?
                <div ref={this._refContent}>
                  <div id="fpInfo">
                    <h2>+ False Positives +</h2>
                    <p>
                      Humans are amazing at visual identification. NSFW tries to
                      error more on the side of things being dirty than clean.
                      It's part of what makes failures on NSFW JS entertaining
                      as well as practical. This algorithm for NSFW JS is
                      constantly getting improved,{' '}
                      <strong>and you can help!</strong>
                    </p>
                    <h3>Ways to Help!</h3>
                    <p>
                      <ul>
                        <li>
                          🌟
                          <a
                            href="https://github.com/alexkimxyz/nsfw_data_scrapper"
                            target="_blank"
                          >
                            Contribute to the Data Scraper
                          </a>{' '}
                          - Noticed any common misclassifications? Just PR a
                          subreddit that represents those misclassifications.
                          Future models will be smarter!
                        </li>
                        <li>
                          🌟
                          <a
                            href="https://github.com/gantman/nsfw_model"
                            target="_blank"
                          >
                            Contribute to the Trainer
                          </a>{' '}
                          - The algorithm is public. Advancements here help NSFW
                          JS and other projects!
                        </li>
                      </ul>
                      <a
                        href="https://medium.freecodecamp.org/machine-learning-how-to-go-from-zero-to-hero-40e26f8aa6da"
                        target="_blank"
                      >
                        <strong>
                          Learn more about how Machine Learning works!
                        </strong>
                      </a>
                    </p>
                  </div>
                </div>
              </div>
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
          </div>
          {this._renderSpinner()}
          <div id="results">
            <p>{this.state.message}</p>
<p> results here </p>
            {this._renderPredictions()}
          </div>
        </main>
        <footer>
          <div>Copyright Now(ish)</div>
          <div>
            <a href="https://github.com/infinitered/nsfwjs">NSFWJS GitHub</a>
          </div>
          <div>
            <a href="https://github.com/gantman/nsfw_model">Model Repo</a>
          </div>
          <div>
            <a href="https://shift.infinite.red/avoid-nightmares-nsfw-js-ab7b176978b1">
              Blog Post
            </a>
          </div>
          <div>
            <a href="https://infinite.red">
              <img src={ir} alt="infinite red logo" />
            </a>
          </div>
        </footer>
      </div>
    )
  }
}

export default App
