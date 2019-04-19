import React from 'react'
import {
  VictoryBar,
  VictoryChart,
  VictoryAxis,
  VictoryTooltip,
  VictoryLegend
} from 'victory'

export default props => (
  <VictoryChart height={150} domainPadding={{ x: 10 }}>
    <VictoryAxis
      style={{
        tickLabels: { fill: '#fff', fontSize: 8, padding: 0 },
        axisLabel: { fill: '#fff', fontSize: 8, padding: 10 }
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
    <VictoryLegend
      x={15}
      y={125}
      width={100}
      orientation="horizontal"
      gutter={12}
      style={{
        border: { stroke: 'black' },
        labels: { fill: 'white', fontSize: 8 }
      }}
      data={[
        { name: 'Hentai', symbol: { fill: '#eef442', fillOpacity: 0.8 } },
        { name: 'Porn', symbol: { fill: '#f00', fillOpacity: 0.8 } },
        { name: 'Sexy', symbol: { fill: '#e79f23', fillOpacity: 0.8 } },
        { name: 'Drawing', symbol: { fill: '#0f0', fillOpacity: 0.8 } },
        { name: 'Neutral', symbol: { fill: '#fff', fillOpacity: 0.8 } }
      ]}
    />
    <VictoryBar
      animate={true}
      labelComponent={<VictoryTooltip style={{ fontSize: 10 }} />}
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
      events={[{
        target: "data",
        eventHandlers: {
          onMouseOver: () => {
            return [{
              target: 'data',
              mutation: (victoryBarProps) => {
                props.gifControl.pause();
                props.gifControl.move_to(victoryBarProps.index);
                return null;
              }
            }, {
              target: 'labels',
              mutation: () => ({ active: true })
            }];
          },
          onMouseOut: () => {
            return [{
              target: 'data',
              mutation: () => {
                props.gifControl.play();
                return null;
              }
            }, {
              target: 'labels',
              mutation: () => ({ active: false })
            }];
          }
        }
      }]}
    />
  </VictoryChart>
)
