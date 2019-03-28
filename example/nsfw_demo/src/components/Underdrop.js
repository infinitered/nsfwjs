import React, { Component } from 'react'
import Switch from 'react-switch'
import Drop from 'tether-drop'

export default class Underdrop extends Component {
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
  }

  _refTarget = ref => {
    this.hoverTarget = ref
  }

  _refContent = ref => {
    this.hoverContent = ref
  }

  render() {
    return (
      <div id="underDrop">
        <div ref={this._refTarget} className="clickTarget">
          False Positive?
          <div ref={this._refContent}>
            <div id="fpInfo">
              <h2>+ False Positives +</h2>
              <p>
                Humans are amazing at visual identification. NSFW tries to error
                more on the side of things being dirty than clean. It's part of
                what makes failures on NSFW JS entertaining as well as
                practical. This algorithm for NSFW JS is constantly getting
                improved, <strong>and you can help!</strong>
              </p>
              <h3>Ways to Help!</h3>
              <div>
                <ul>
                  <li>
                    🌟
                    <a
                      href="https://github.com/alexkimxyz/nsfw_data_scrapper"
                      target="_blank"
                    >
                      Contribute to the Data Scraper
                    </a>{' '}
                    - Noticed any common misclassifications? Just PR a subreddit
                    that represents those misclassifications. Future models will
                    be smarter!
                  </li>
                  <li>
                    🌟
                    <a
                      href="https://github.com/gantman/nsfw_model"
                      target="_blank"
                    >
                      Contribute to the Trainer
                    </a>{' '}
                    - The algorithm is public. Advancements here help NSFW JS
                    and other projects!
                  </li>
                </ul>
                <a
                  href="https://medium.freecodecamp.org/machine-learning-how-to-go-from-zero-to-hero-40e26f8aa6da"
                  target="_blank"
                >
                  <strong>Learn more about how Machine Learning works!</strong>
                </a>
              </div>
            </div>
          </div>
        </div>
        <div className="switchStation" id="camBlock">
          <p id="camDescription">
            <span>Camera</span>
          </p>
          <Switch
            onColor="#e79f23"
            offColor="#000"
            onChange={this.props.camChange}
            checked={this.props.camStatus}
          />
        </div>
        <div className="switchStation">
          <p id="blurDescription">
            <span>Blur Protection</span>
          </p>
          <Switch
            onColor="#e79f23"
            offColor="#000"
            onChange={this.props.blurChange}
            checked={this.props.blurStatus}
          />
        </div>
      </div>
    )
  }
}
