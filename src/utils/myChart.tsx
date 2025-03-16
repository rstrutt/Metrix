import React from 'react';
import {View, Dimensions} from 'react-native';
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

import { Svg, Line as SVGLine, G, Text as SVGText, Rect, Circle as SVGCircle, Polygon } from 'react-native-svg';

function ToolTip({state, font}: {state: any; font: any}) {
  return (
    <>
      <Circle
        cx={state.x.position.value}
        cy={state.y.metricValue.position.value}
        r={8}
        color="blue"
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

export const MyVictoryChart = ({
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

export const MySVGChart = ({
                        data,
                        minThreshold,
                        maxThreshold
                    }: {
    data: {dateTime: string; value: number}[];
    minThreshold: number;
    maxThreshold: number;
}) => {

    const width = Dimensions.get('window').width - 75;
    const height = 150;
    const padding = 20;
    const leftPadding = 30;
    const rightPadding = 15;
    const xMin = Math.min(...data.map(d => new Date(d.dateTime).getTime()));
    const xMax = Math.max(...data.map(d => new Date(d.dateTime).getTime()));
    const yMin = minThreshold === 0 ? 0 : Math.min(...data.map(d => d.value), minThreshold) * 0.9;
    const yMax = Math.max(...data.map(d => d.value), maxThreshold) * 1.1;

    const scaleX = (value: number) => ((value - xMin) / (xMax - xMin)) * (width - leftPadding - rightPadding) + leftPadding;
    const scaleY = (value: number) => height - ((value - yMin) / (yMax - yMin)) * (height - 2 * padding) - padding;

    const xTicks = Array.from({ length: 6 }, (_, i) => xMin + (i * (xMax - xMin)) / 5);
    const yTicks = Array.from({ length: 5 }, (_, i) => yMin + (i * (yMax - yMin)) / 4);

    const DATA = Array.from({ length: 31 }, (_, i) => ({
        day: i,
        highTmp: 40 + 30 * Math.random(),
    }));

    const formattedData = data.map(d => ({
        dateTime: new Date(d.dateTime).getTime(),
        value: d.value
    }));

    const getPointColor = (value: number, minThreshold: number, maxThreshold: number): string => {
        if (maxThreshold > minThreshold) {
            if (value < minThreshold) {
                return "yellow";
            } else if (value > maxThreshold) {
                return "red";
            } else {
                return "green";
            }
        } else if (maxThreshold < minThreshold) {
            if (value < maxThreshold) {
                return "red";
            } else if (value > minThreshold) {
                return "yellow";
            } else {
                return "green";
            }
        } else {
            return "black";
        }
    };

    return (
        <View style={{height: 150, paddingHorizontal: 0}}>
            <Svg width={width + rightPadding} height={height}>
                <Rect x="0" y="0" width={width + rightPadding} height={height} fill="#d3d3d3" rx="10" ry="10" />
                <G>
                    {xTicks.map((t, i) => (
                        <SVGLine
                            key={`x-grid-${i}`}
                            x1={scaleX(t)}
                            y1={padding}
                            x2={scaleX(t)}
                            y2={height - padding}
                            stroke="#e0e0e0"
                            strokeWidth="1"
                        />
                    ))}
                    {yTicks.map((t, i) => (
                        <SVGLine
                            key={`y-grid-${i}`}
                            x1={leftPadding}
                            y1={scaleY(t)}
                            x2={width - padding}
                            y2={scaleY(t)}
                            stroke="#e0e0e0"
                            strokeWidth="1"
                        />
                    ))}
                    <SVGLine
                        x1={leftPadding}
                        y1={height - padding}
                        x2={width - rightPadding}
                        y2={height - padding}
                        stroke="black"
                        strokeWidth="2"
                    />
                    <SVGLine
                        x1={leftPadding}
                        y1={padding}
                        x2={leftPadding}
                        y2={height - padding}
                        stroke="black"
                        strokeWidth="2"
                    />
                    <SVGLine
                        x1={leftPadding}
                        y1={scaleY(minThreshold)}
                        x2={width - rightPadding}
                        y2={scaleY(minThreshold)}
                        stroke="yellow"
                        strokeWidth="2"
                        strokeDasharray="4"
                    />
                    <SVGLine
                        x1={leftPadding}
                        y1={scaleY(maxThreshold)}
                        x2={width - rightPadding}
                        y2={scaleY(maxThreshold)}
                        stroke="red"
                        strokeWidth="2"
                        strokeDasharray="4"
                    />
                    <Polygon
                        points={`${leftPadding},${scaleY(minThreshold)} ${width - rightPadding},${scaleY(minThreshold)} ${width - rightPadding},${scaleY(maxThreshold)} ${leftPadding},${scaleY(maxThreshold)}`}
                        fill="lightgreen"
                        opacity="0.3"
                    />
                    {data.map((d, i) => (
                        i > 0 && (
                            <SVGLine
                                key={`line-${i}`}
                                x1={scaleX(new Date(data[i - 1].dateTime).getTime())}
                                y1={scaleY(data[i - 1].value)}
                                x2={scaleX(new Date(d.dateTime).getTime())}
                                y2={scaleY(d.value)}
                                stroke="#007AFF"
                                strokeWidth="2"
                            />
                        )
                    ))}
                    {data.map((d, i) => (
                        <SVGCircle
                            key={`circle-${i}`}
                            cx={scaleX(new Date(d.dateTime).getTime())}
                            cy={scaleY(d.value)}
                            r={3}
                            fill={getPointColor(d.value, minThreshold, maxThreshold)}
                        />
                    ))}
                    {xTicks.map((t, i) => (
                        <SVGText
                            key={`x-label-${i}`}
                            x={scaleX(t)}
                            y={height - padding / 2}
                            fontSize="10"
                            fill="black"
                            textAnchor="middle"
                        >
                            {new Date(t).toLocaleDateString()}
                        </SVGText>
                    ))}
                    {yTicks.map((t, i) => (
                        <SVGText
                            key={`y-label-${i}`}
                            x={leftPadding - 5}
                            y={scaleY(t) + 5}
                            fontSize="10"
                            fill="black"
                            textAnchor="end"
                        >
                            {Math.round(t)}
                        </SVGText>
                    ))}
                    <SVGText
                        x={width - rightPadding + 5}
                        y={scaleY(minThreshold) + 5}
                        fontSize="10"
                        fill="yellow"
                        textAnchor="start"
                    >
                        {minThreshold}
                    </SVGText>
                    <SVGText
                        x={width - rightPadding + 5}
                        y={scaleY(maxThreshold) - 5}
                        fontSize="10"
                        fill="red"
                        textAnchor="start"
                    >
                        {maxThreshold}
                    </SVGText>
                </G>
            </Svg>
        </View>
    );
};

