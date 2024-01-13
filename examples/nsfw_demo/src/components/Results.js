import React from 'react'
import GifBar from './GifBar'

// Render Text Prediction OR GifBar
const renderPredictions = props => {
  // only render if predictions is in singular format
  if (props.predictions[0] && props.predictions[0].className) {
    return (
      <div id="predictions">
        <ul>
          {props.predictions.map(prediction => (
            <li key={prediction.className}>
              {prediction.className} -{' '}
              {(prediction.probability * 100).toFixed(2)}%
            </li>
          ))}
        </ul>
      </div>
    )
  } else if (props.predictions[0]) {
    return <GifBar data={props.predictions} gifControl={props.gifControl} />
  }
}

export default props => (
  <div id="results">
    <p>{props.message}</p>
    {renderPredictions(props)}
  </div>
)
