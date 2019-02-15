import React, { Component } from 'react'
import logo from './logo.svg'
import ir from './ir.svg'
import tflogo from './tflogo.jpg'
import './App.css'
import * as nsfwjs from 'nsfwjs'

class App extends Component {
  state = {
    topMessage: 'Open Dev/Inspect Menu to Assure Success',
    bottomMessage: 'Loading model and checking image!'
  }
  async componentDidMount() {
    const img = document.getElementById('img')
    const model = await nsfwjs.load('/model/')
    const predictions = await model.classify(img)
    this.setState({
      topMessage: `This is ${predictions[0].className}`,
      bottomMessage: `NSFWJS is ${(predictions[0].probability * 100).toFixed(2)}% sure`
    })
    console.log(predictions)
  }

  render() {
    return (
      <div className="App">
        <div className="menu">
          <img src={logo} className="App-logo" alt="logo" />
          <h1>
            Client-side indecent content checking
          </h1>
          <div className="snippet">
              <p>Powered by</p>
            <a href="https://js.tensorflow.org/" targe="_blank">
              <img src={tflogo} id="tflogo" />
            </a>
          </div>
        </div>
        <header className="App-header">

          <img src="https://i.imgur.com/6ixnTIj.gif" id="img" crossOrigin="anonymous" alt="thing to check"/>
          <p>
            {this.state.topMessage}
          </p>
          <p>
            {this.state.bottomMessage}
          </p>
        </header>
        <footer>
          <ul>
              <li>Copyright Now(ish)</li>
              <li>
                <a href="https://github.com/infinitered/nsfwjs">
                  GitHub
                </a>
              </li>
              <li>
                <a href="https://github.com/gantman/nsfw_model">Model Repo</a>
              </li>
              <li>
                <a href="https://infinite.red">
                  <img src={ir} />
                </a>
              </li>
            </ul>
        </footer>
      </div>
    );
  }
}

export default App;
