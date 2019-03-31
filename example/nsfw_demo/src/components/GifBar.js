import React from 'react'
import { VictoryBar, VictoryChart, VictoryAxis, VictoryTooltip } from 'victory'

export default props => (
  <VictoryChart height={150} domainPadding={{ x: 10 }}>
    <VictoryAxis
      style={{
        tickLabels: { fill: '#fff', fontSize: 8 },
        axisLabel: { fill: '#fff', fontSize: 8 }
      }}
      label="GIF Frame Index"
    />
    <VictoryAxis
      dependentAxis
      style={{
        tickLabels: { fill: '#fff', fontSize: 8 },
        grid: { stroke: 'gray' },
        ticks: { stroke: 'gray', size: 10 }
      }}
      tickValues={[0, 0.25, 0.5, 0.75, 1.0]}
      // tickFormat specifies how ticks should be displayed
      tickFormat={x => `${(x * 100).toFixed(0)}%`}
    />
    <VictoryBar
      animate={true}
      labelComponent={<VictoryTooltip style={{ fontSize: 8 }} />}
      labels={d => `${(d.probability * 100).toFixed(0)}% ${d.className}`}
      style={{
        data: {
          fill: d => {
            switch (d.className) {
              case 'Hentai':
                return '#eef442'
              case 'Porn':
                return '#f00'
              case 'Sexy':
                return '#e79f23'
              case 'Drawing':
                return '#0f0'
              case 'Neutral':
                return '#fff'
            }
          },
          fillOpacity: 0.8
        }
      }}
      barRatio={1}
      data={props.data && props.data.flat()}
      y="probability"
    />
  </VictoryChart>
)
