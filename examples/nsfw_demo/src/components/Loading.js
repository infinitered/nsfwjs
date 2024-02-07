import React from 'react'
import * as Spinner from 'react-spinkit'

const Loading = ({ showLoading }) => {
  if (showLoading) {
    return (
      <div id="spinContainer">
        <Spinner name="cube-grid" color="#e79f23" id="processCube" />
      </div>
    )
  }

  return null
}

export default Loading
