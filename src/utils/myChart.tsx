import React from 'react';
import { View } from 'react-native';
import { CartesianChart, Line, Scatter } from 'victory-native';
import { useFont, Circle, Text } from "@shopify/react-native-skia";

import inter from "../../assets/fonts/Roboto-Regular.ttf";
import { useChartPressState, useChartTransformState  } from "victory-native";
import type { SharedValue } from "react-native-reanimated";

function ToolTip({ x, y, font }: { x: SharedValue<number>; y: SharedValue<number>, font: any }) {
    return <>
        <Circle cx={x} cy={y} r={8} color="black" />
        <Text x={x.value + 10} y={y} text={`${y.value.toFixed(2)}`} color="black" font={font} />
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
    value: d.value,
  }));

  const font = useFont(inter, 12);
  const { state, isActive } = useChartPressState({ x: 0, y: { value: 0 } });

  // const transformState = useChartTransformState({
  //     scaleX: 2.0, // Initial X-axis scale
  //     scaleY: 2.0, // Initial Y-axis scale
  // });


    return (
    <View style={{height: 150, paddingHorizontal: 0}}>
      <CartesianChart
        data={formattedData}
        xKey="dateTime"
        yKeys={['value']}
        axisOptions={{font}}
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
            <Line points={points.value} color="gray" strokeWidth={2} />
            <Scatter
              points={points.value}
              radius={3}
              style="fill"
              color="blue"
            />
              {isActive && (
                  <ToolTip x={state.x.position} y={state.y.value.position} font={font}/>
              )}
          </>
        )}
      </CartesianChart>
    </View>
  );
};

export default MyChart;
