import React from 'react'
import tflogo from '../tflogo.jpg'
import logo from '../logo.svg'

export default () => (
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
)
