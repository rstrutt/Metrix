import React from 'react';
import {View} from 'react-native';
import {CartesianChart, Line, Scatter} from 'victory-native';
import {useFont, Circle, Text} from '@shopify/react-native-skia';

import inter from '../../assets/fonts/Roboto-Regular.ttf';
import {useChartPressState} from 'victory-native';
import type {SharedValue} from 'react-native-reanimated';
import {
  timestampToDateString,
  timestampToDateTimeString,
  timestampToMonthYear,
} from './dateUtils.ts';
import {ChartPressState} from 'victory-native/src/cartesian/hooks/useChartPressState.ts';

function ToolTip({state, font}: {state: ChartPressState; font: any}) {
  return (
    <>
      <Circle
        cx={state.x.position.value}
        cy={state.y.metricValue.position.value}
        r={8}
        color="black"
      />
      <Text
        x={state.x.position.value + 10}
        y={state.y.metricValue.position.value}
        text={`${state.y.metricValue.value.value.toFixed(
          2,
        )} (${timestampToDateTimeString(state.x.value.value)})`}
        color="black"
        font={font}
      />
    </>
  );
}

const MyChart = ({
  data,
  minThreshold,
  maxThreshold,
}: {
  data: {dateTime: string; value: number}[];
  minThreshold: number;
  maxThreshold: number;
}) => {
  const formattedData = data.map(d => ({
    dateTime: new Date(d.dateTime).getTime(),
    metricValue: d.value,
    redMetricValue: d.value > maxThreshold ? d.value : null,
    greenMetricValue: d.value < minThreshold ? d.value : null,
    blueMetricValue:
      d.value >= minThreshold && d.value <= maxThreshold ? d.value : null,
    minThreshold: minThreshold,
    maxThreshold: maxThreshold,
  }));

  const min_x = formattedData[0].dateTime;
  const max_x = formattedData[formattedData.length - 1].dateTime;
  const min_y = formattedData
    .map(d => d.metricValue)
    .reduce((a, b) => Math.min(a, b));
  const max_y = formattedData
    .map(d => d.metricValue)
    .reduce((a, b) => Math.max(a, b));

  const min_y_with_threshold = Math.min(min_y, minThreshold);
  const max_y_with_threshold = Math.max(max_y, maxThreshold);

  const font = useFont(inter, 12);
  const {state, isActive} = useChartPressState({
    x: 0,
    y: {
      metricValue: 0,
      redMetricValue: 0,
      greenMetricValue: 0,
      blueMetricValue: 0,
      minThreshold: 0,
      maxThreshold: 0,
    },
  });

  // const transformState = useChartTransformState({
  //     scaleX: 2.0, // Initial X-axis scale
  //     scaleY: 2.0, // Initial Y-axis scale
  // });

  const formatXLabel = (tick: number) => `${timestampToMonthYear(tick)}`;

  return (
    <View style={{height: 150, paddingHorizontal: 0}}>
      <CartesianChart
        data={formattedData}
        xKey="dateTime"
        yKeys={[
          'metricValue',
          'redMetricValue',
          'greenMetricValue',
          'blueMetricValue',
          'minThreshold',
          'maxThreshold',
        ]}
        axisOptions={{font: font, formatXLabel: formatXLabel}}
        chartPressState={state}
        domain={{
          x: [min_x - (max_x - min_x) * 0.05, max_x + (max_x - min_x) * 0.05],
          y: [
            min_y_with_threshold - (max_y - min_y) * 0.05,
            max_y_with_threshold + (max_y - min_y) * 0.05,
          ],
        }}
        // transformState={transformState.state}
        // transformConfig={{
        //     pan: {
        //         activateAfterLongPress: 100, // Delay in ms before pan gesture activates
        //     },
        //     pinch: {
        //         enabled: true, // Enable pinch gesture
        //     },
        // }}
      >
        {({points}) => (
          <>
            <Line points={points.metricValue} color="gray" strokeWidth={2} />
            <Line points={points.minThreshold} color="green" strokeWidth={1} />
            <Line points={points.maxThreshold} color="red" strokeWidth={1} />
            {/*<Line points={new Array(points.metricValue).fill(minThreshold)} color="green" strokeWidth={2} />*/}
            <Scatter
              points={points.greenMetricValue}
              radius={3}
              style="fill"
              color="green"
            />
            <Scatter
              points={points.blueMetricValue}
              radius={3}
              style="fill"
              color="blue"
            />
            <Scatter
              points={points.redMetricValue}
              radius={3}
              style="fill"
              color="red"
            />
            {isActive && <ToolTip state={state} font={font} />}
          </>
        )}
      </CartesianChart>
    </View>
  );
};

export default MyChart;
