import React, {useEffect, useState, useRef, useMemo} from 'react';
import {View, useWindowDimensions, Dimensions} from 'react-native';
import { Svg, Line as SVGLine, G, Text as SVGText, Rect, Circle as SVGCircle, Polygon } from 'react-native-svg';
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
} from './DateUtils.ts';

import Animated, {
    useSharedValue,
    useAnimatedProps,
    useDerivedValue
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';


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

  const height = 175;

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
    <View style={{height: height, paddingHorizontal: 0}}>
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
                               maxThreshold,
                               fullScreen
                           }: {
    data: { dateTime: string; value: number }[];
    minThreshold: number;
    maxThreshold: number;
    fullScreen: boolean;
}) => {
    const { width: screenWidth, height: screenHeight } = useWindowDimensions();
    const isLandscape = screenWidth > screenHeight;
    // When we go full screen, we don't want to have padding on the right
    // (might need to tweak on Apple as we won't have removed the nav bar)
    const width = (fullScreen)? screenWidth - ((isLandscape) ? -45 : 32) : screenWidth - ((isLandscape) ? 0 : 64);
    const height = (fullScreen) ? screenHeight - ((isLandscape)?80:125) : 175;
    const padding = 20;
    const leftPadding = 30;
    const rightPadding = 15;
    const xMin = Math.min(...data.map(d => new Date(d.dateTime).getTime()));
    const xMax = Math.max(...data.map(d => new Date(d.dateTime).getTime()));
    const yMinValue = Math.min(...data.map(d => d.value));
    const yMaxValue = Math.max(...data.map(d => d.value));
    const yMinValueWithThreshold = Math.min(yMinValue, minThreshold);
    const yMaxValueWithThreshold = Math.max(yMaxValue, maxThreshold);
    const yMin = minThreshold === 0 ? 0 : yMinValueWithThreshold - (yMaxValueWithThreshold - yMinValueWithThreshold) * 0.1;
    const yMax = yMaxValueWithThreshold + (yMaxValueWithThreshold - yMinValueWithThreshold) * 0.1;
    const scaleX = (value: number) => ((value - xMin) / (xMax - xMin)) * (width - leftPadding - rightPadding) + leftPadding;
    const scaleY = (value: number) => height - ((value - yMin) / (yMax - yMin)) * (height - 2 * padding) - padding;
    const xTicks = Array.from({ length: 6 }, (_, i) => xMin + (i * (xMax - xMin)) / 5);
    const yTicks = Array.from({ length: 5 }, (_, i) => yMin + (i * (yMax - yMin)) / 4);
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

    const [tooltip, setTooltip] = useState<{ visible: boolean, x: number, y: number, x_value: number, y_value: string } | null>(null);

    useEffect(() => {
        // This set-up is to clear the tooltips on a rotation change, as they will be in the wrong place...
        const handleOrientationChange = () => {
            setTooltip(null);
        };

        Dimensions.addEventListener('change', handleOrientationChange);

        return () => {
            // Dimensions.removeEventListener('change', handleOrientationChange);
        };
    }, []);

    const scale = useSharedValue(1);
    const translationX = useSharedValue(0);
    const translationY = useSharedValue(0);
    // const lastOffset = useRef({ x: 0, y: 0 });
    const lastOffsetX = useSharedValue(0);
    const lastOffsetY = useSharedValue(0);

    const [transformStringBothAxes, setTransformStringBothAxesBothAxes] = useState('translate(0, 0) scale(1)');
    const [transformStringXAxis, setTransformStringXAxis] = useState('translate(0, 0) scale(1)');
    const [transformStringYAxis, setTransformStringYAxis] = useState('translate(0, 0) scale(1)');

    const transformDerivedBothAxes = useDerivedValue(() => {
        return `translate(${translationX.value}, ${translationY.value}) scale(${scale.value})`;
    });
    const transformDerivedXaxis = useDerivedValue(() => {
        return `translate(${translationX.value}, 0)`;
    });
    const transformDerivedYaxis = useDerivedValue(() => {
        return `translate(0, ${translationY.value})`;
    });

    useEffect(() => {
        const id = setInterval(() => {
            setTransformStringBothAxesBothAxes(transformDerivedBothAxes.value);
            setTransformStringXAxis(transformDerivedXaxis.value);
            setTransformStringYAxis(transformDerivedYaxis.value);
        }, 16); // ~60fps

        return () => clearInterval(id);
    }, []);


    const pinchGesture = useMemo(() =>
            Gesture.Pinch()
                .onUpdate((e) => {
                    scale.value = e.scale;
                })
        , []);

    const panGesture = useMemo(() =>
            Gesture.Pan()
                .onUpdate((e) => {
                    translationX.value = lastOffsetX.value + e.translationX;
                    translationY.value = lastOffsetY.value + e.translationY;
                })
                .onEnd((e) => {
                    lastOffsetX.value += e.translationX;
                    lastOffsetY.value += e.translationY;
                })
        , []);

    const composedGesture = useMemo(
        () => Gesture.Simultaneous(pinchGesture, panGesture),
        [pinchGesture, panGesture]
    );

    const theChart = (
        <View style={{ height: height, paddingHorizontal: 0 }}>
            <Svg width={width + rightPadding} height={height}>
                <Rect x="0" y="0" width={width + rightPadding} height={height} fill="#d3d3d3" rx="10" ry="10" />
                {tooltip && (
                    <G>
                        {/*The tooltip text that we put at the top of the plot*/}
                        <SVGText x={width / 2 - 50} y={15} fontSize="12" fill="black">
                            {tooltip.x_value} ({tooltip.y_value})
                        </SVGText>
                        {/*Overlay with Bold, just for the value*/}
                        <SVGText x={width/2 - 50} y={15} fontSize="12" fill="black" fontWeight="bold">
                            {tooltip.x_value}
                        </SVGText>
                    </G>
                )}
                {/* Render the axes without translation */}
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

                {/* Apply translation to the plot contents */}
                <G transform={transformStringXAxis}>
                    {xTicks.map((t, i) => (
                        <SVGText
                            key={`x-label-${i}`}
                            x={scaleX(t)}
                            y={(height - padding / 2) + 5}
                            fontSize="10"
                            fill="black"
                            textAnchor="middle"
                        >
                            {new Date(t).toLocaleDateString('en-CA', { year: "numeric", month: "short" })}
                        </SVGText>
                    ))}
                </G>
                <G transform={transformStringYAxis}>
                    {yTicks.map((t, i) => (
                        <SVGText
                            key={`y-label-${i}`}
                            x={leftPadding - 5}
                            y={scaleY(t) + 5}
                            fontSize="10"
                            fill="black"
                            textAnchor="end"
                        >
                            {/*0dp if a large range, else 1dp*/}
                            {((yMax  -yMin)>3)?Math.round(t):t.toFixed(1)}
                        </SVGText>
                    ))}
                </G>
                <G transform={transformStringBothAxes}>
                    <SVGLine
                        x1={leftPadding}
                        y1={scaleY(maxThreshold)}
                        x2={width - rightPadding}
                        y2={scaleY(maxThreshold)}
                        stroke="red"
                        strokeWidth="2"
                        strokeDasharray="4"
                    />
                    <SVGText
                        x={width - rightPadding + 5}
                        y={scaleY(maxThreshold) + 3}
                        fontSize="10"
                        fill="red"
                        textAnchor="start"
                    >
                        {maxThreshold}
                    </SVGText>
                    <SVGLine
                        x1={leftPadding}
                        y1={scaleY(minThreshold)}
                        x2={width - rightPadding}
                        y2={scaleY(minThreshold)}
                        stroke="yellow"
                        strokeWidth="2"
                        strokeDasharray="4"
                    />
                    <SVGText
                        x={width - rightPadding + 5}
                        y={scaleY(minThreshold) + 3}
                        fontSize="10"
                        fill="yellow"
                        textAnchor="start"
                    >
                        {minThreshold}
                    </SVGText>

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
                    {/*Bigger, transparent circles to act as the tooltip trigger*/}
                    {data.map((d, i) => (
                        <SVGCircle
                            key={`circle-${i}`}
                            cx={scaleX(new Date(d.dateTime).getTime())}
                            cy={scaleY(d.value)}
                            r={10}
                            fill="none"
                            onPressIn={() => setTooltip({ visible: true, x: scaleX(new Date(d.dateTime).getTime()), y: scaleY(d.value), x_value: d.value, y_value: d.dateTime })}
                        />
                    ))}
                    {tooltip && (
                        <G>
                            {/*The tooltip highlighting*/}
                            <SVGCircle cx={tooltip.x} cy={tooltip.y} r={6} stroke="blue" strokeWidth="3" fill="none" />
                        </G>
                    )}
                </G>
            </Svg>
        </View>
    );


    return (
        // If we're in full screen mode, we need to handle gestures, so wrap in the gesture haandlers,
        // otherwise just return the chart
        fullScreen? (
            <GestureDetector gesture={composedGesture}>
                {theChart}
            </GestureDetector>
        ): theChart

    );
};

