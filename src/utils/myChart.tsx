import React from 'react';
import {View} from 'react-native';
import {
  CartesianChart,
  Line,
  Scatter,
} from 'victory-native';
import {useFont, Circle, Text} from '@shopify/react-native-skia';

// @ts-ignore
import bold from '../../assets/fonts/Roboto-Bold.ttf';
import {useChartPressState} from 'victory-native';

import {
  timestampToDateTimeString,
  timestampToMonthYear,
} from './dateUtils.ts';

function ToolTip({state, font}: {state: any; font: any}) {
  return (
    <>
      <Circle
        cx={state.x.position.value}
        cy={state.y.metricValue.position.value}
        r={8}
        color="red"
        style="stroke"
        strokeWidth={2}
      />
      <Text
        x={100}
        y={12}
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
  maxThreshold
}: {
  data: {dateTime: string; value: number}[];
  minThreshold: number;
  maxThreshold: number;
}) => {

  const formattedData = data.map(d => ({
    dateTime: new Date(d.dateTime).getTime(),
    metricValue: d.value,
    redMetricValue: (maxThreshold>minThreshold)?(d.value > maxThreshold ? d.value : null):(d.value < maxThreshold ? d.value : null),
    greenMetricValue: (maxThreshold>minThreshold)?(d.value < minThreshold ? d.value : null):(d.value > minThreshold ? d.value : null),
    blueMetricValue:
        (maxThreshold>minThreshold)?(d.value >= minThreshold && d.value <= maxThreshold ? d.value : null):(d.value <= minThreshold && d.value >= maxThreshold ? d.value : null),
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

  const min_y_with_threshold = Math.min(min_y, Math.min(minThreshold, maxThreshold));
  const max_y_with_threshold = Math.max(max_y, Math.max(minThreshold, maxThreshold));

  const font = useFont(bold, 12);
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
            min_y_with_threshold - (max_y_with_threshold - min_y_with_threshold) * 0.05,
            max_y_with_threshold + (max_y_with_threshold - min_y_with_threshold) * 0.1,
          ],
        }}
      >
        {({points}) => (
          <>
            <Line points={points.metricValue} color="gray" strokeWidth={2} />
            <Line points={points.minThreshold} color="green" strokeWidth={1} />
            <Line points={points.maxThreshold} color="red" strokeWidth={1} />
            <Scatter
              points={points.greenMetricValue}
              radius={3}
              style="fill"
              color="yellow"
            />
            <Scatter
              points={points.blueMetricValue}
              radius={3}
              style="fill"
              color="green"
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
