import React from 'react'

const renderPredictions = props => {
  return (
    <div id="predictions">
      <ul>
        {props.predictions.map(prediction => (
          <li id={prediction.className}>
            {prediction.className} - {(prediction.probability * 100).toFixed(2)}
            %
          </li>
        ))}
      </ul>
    </div>
  )
}

export default props => (
  <div id="results">
    <p>{props.message}</p>
    {renderPredictions(props)}
  </div>
)
