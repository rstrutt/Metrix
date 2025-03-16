import React from 'react';
import { View } from 'react-native';
import { CartesianChart, Line, Scatter } from 'victory-native';
import { useFont, Circle, Text } from "@shopify/react-native-skia";

import inter from "../../assets/fonts/Roboto-Regular.ttf";
import { useChartPressState  } from "victory-native";
import type { SharedValue } from "react-native-reanimated";
import {timestampToDateString, timestampToDateTimeString} from "./dateUtils.ts";
import {ChartPressState} from "victory-native/src/cartesian/hooks/useChartPressState.ts";

function ToolTip({ state, font }: { state: ChartPressState, font: any }) {
    return <>
        <Circle cx={state.x.position.value} cy={state.y.metricValue.position.value} r={8} color="black" />
        <Text x={state.x.position.value + 10} y={state.y.metricValue.position.value} text={`${state.y.metricValue.value.value.toFixed(2)} (${timestampToDateTimeString(state.x.value.value)})`} color="black" font={font} />
        </>
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
  }));

  const font = useFont(inter, 12);
  const { state, isActive } = useChartPressState({ x: 0,  y: { metricValue: 0 } });

  // const transformState = useChartTransformState({
  //     scaleX: 2.0, // Initial X-axis scale
  //     scaleY: 2.0, // Initial Y-axis scale
  // });

    const formatXLabel = (tick:number) => `${timestampToDateString(tick)}`;

    return (
    <View style={{height: 150, paddingHorizontal: 0}}>
      <CartesianChart
        data={formattedData}
        xKey="dateTime"
        yKeys={['metricValue']}
        axisOptions={{font: font, formatXLabel: formatXLabel}}
        chartPressState={state}
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
            <Scatter
              points={points.metricValue}
              radius={3}
              style="fill"
              color="blue"
            />
              {isActive && (
                  <ToolTip state={state}  font={font}/>
              )}
          </>
        )}
      </CartesianChart>
    </View>
  );
};

export default MyChart;
