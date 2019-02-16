import React, { Component } from 'react'
import logo from './logo.svg'
import ir from './ir.svg'
import tflogo from './tflogo.jpg'
import './App.css'
import * as nsfwjs from 'nsfwjs'
import Dropzone from 'react-dropzone'

class App extends Component {
  state = {
    model: null,
    graphic: logo,
    titleMessage: 'Please hold, the model is loading...',
    topMessage: '',
    bottomMessage: ''
  }
  componentDidMount() {
    // Load model!
    nsfwjs.load('/model/').then(model => {
      this.setState({
        model,
        titleMessage: 'Please drag and drop an image to check!'
      })
    })
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  checkContent = async () => {
    // Strange race condition grabbing image before it's rendered
    // Not really a problem of this library, more so react silliness
    await this.sleep(100)
    const img = this.refs.dropped
    const predictions = await this.state.model.classify(img)
    this.setState({
      topMessage: `This is ${predictions[0].className}`,
      bottomMessage: `${(predictions[0].probability * 100).toFixed(2)}% sure`
    })
    console.log(predictions)
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
      this.setState({
        topMessage: 'Processing',
        bottomMessage: ''
      })
      this.setFile(accepted[0])
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
          <Dropzone
            accept="image/jpeg, image/png, image/gif"
            className="photo-box"
            onDrop={this.onDrop.bind(this)}
          >
            <img
              src={this.state.graphic}
              alt="drop your file here"
              className="dropped-photo"
              ref="dropped"
            />
          </Dropzone>
          <p>{this.state.topMessage}</p>
          <p>{this.state.bottomMessage}</p>
        </header>
        <footer>
          <ul>
            <li>Copyright Now(ish)</li>
            <li>
              <a href="https://github.com/infinitered/nsfwjs">GitHub</a>
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
