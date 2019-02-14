import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';
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
        <header className="App-header">
          <p>
            {this.state.topMessage}
          </p>
          <img src={logo} className="App-logo" alt="logo" />
          <img src="https://i.imgur.com/6ixnTIj.gif" id="img" crossOrigin="anonymous" alt="thing to check"/>
        </header>
        <p>
          {this.state.bottomMessage}
        </p>
      </div>
    );
  }
}

export default App;
