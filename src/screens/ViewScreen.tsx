import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useColorScheme } from 'react-native';
import { Svg, Line, G, Text as SvgText, Rect, Circle, Polygon } from 'react-native-svg';
import {
    readMetricValuesFromFile,
    updateMetricValueInFile,
    deleteMetricValueFromFile,
    readMetricsFromFile
} from '../utils/fileUtils.ts';
import { Alert } from 'react-native';
import { generatePastelColor } from "../utils/uiUtils.ts";

const ViewScreen = () => {
    const [entries, setEntries] = useState<{ dateTime: string, metric: string, value: number }[]>([]);
    const isDarkMode = useColorScheme() === 'dark';
    const [refreshing, setRefreshing] = useState(false);
    const [loadedMetrics, setLoadedMetrics] = useState<{ name: string, min_threshold: number, max_threshold: number }[]>([]);
    const [expandedMetrics, setExpandedMetrics] = useState<{ [key: string]: boolean }>({});

    const loadEntries = async () => {
        const loadedMericValues = await readMetricValuesFromFile();
        const loadedMetrics = await readMetricsFromFile();
        setEntries(loadedMericValues);
        setLoadedMetrics(loadedMetrics);
    };

    useEffect(() => {
        loadEntries();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadEntries();
        setRefreshing(false);
    };

    const handleValueChange = (dateTime: string, metric: string, value: string) => {
        const updatedEntries = entries.map(entry =>
            entry.dateTime === dateTime && entry.metric === metric
                ? { ...entry, value: parseFloat(value) }
                : entry
        );
        setEntries(updatedEntries);
    };

    const handleSave = async (dateTime: string, metric: string, value: string) => {
        const parsedValue = parseFloat(value);
        if (isNaN(parsedValue)) {
            Alert.alert('Invalid Input', 'Please enter a valid number.');
            return;
        }
        const updatedEntry = { dateTime, metric, value: parsedValue };
        await updateMetricValueInFile(updatedEntry);
        Alert.alert("Success", "Metric entry has been saved successfully.");
    };

    const handleDelete = async (dateTime: string, metric: string, value: number) => {
        Alert.alert(
            "Confirm Deletion",
            `Are you sure you want to delete the metric entry?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    onPress: async () => {
                        await deleteMetricValueFromFile(dateTime, metric, value);
                        setEntries(entries.filter(entry => !(entry.dateTime === dateTime && entry.metric === metric && entry.value === value)));
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const formatDateTime = (dateTime: string) => {
        if (dateTime.includes('T')) {
            const [dateString, timeString] = dateTime.split('T');
            return `${dateString} ${timeString.slice(0, 5)}`;
        } else {
            return dateTime;
        }
    };

    const groupedEntries = entries.reduce((acc, entry) => {
        if (!acc[entry.metric]) {
            acc[entry.metric] = [];
        }
        acc[entry.metric].push(entry);
        return acc;
    }, {} as { [key: string]: { dateTime: string, metric: string, value: number }[] });

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

    const renderChart = (data: { dateTime: string, value: number }[], minThreshold: number, maxThreshold: number) => {
        const width = Dimensions.get('window').width - 75;
        const height = 220;
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

        return (
            <Svg width={width + rightPadding} height={height}>
                <Rect x="0" y="0" width={width + rightPadding} height={height} fill="#d3d3d3" rx="10" ry="10" />
                <G>
                    {xTicks.map((t, i) => (
                        <Line
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
                        <Line
                            key={`y-grid-${i}`}
                            x1={leftPadding}
                            y1={scaleY(t)}
                            x2={width - padding}
                            y2={scaleY(t)}
                            stroke="#e0e0e0"
                            strokeWidth="1"
                        />
                    ))}
                    <Line
                        x1={leftPadding}
                        y1={height - padding}
                        x2={width - rightPadding}
                        y2={height - padding}
                        stroke="black"
                        strokeWidth="2"
                    />
                    <Line
                        x1={leftPadding}
                        y1={padding}
                        x2={leftPadding}
                        y2={height - padding}
                        stroke="black"
                        strokeWidth="2"
                    />
                    <Line
                        x1={leftPadding}
                        y1={scaleY(minThreshold)}
                        x2={width - rightPadding}
                        y2={scaleY(minThreshold)}
                        stroke="yellow"
                        strokeWidth="2"
                        strokeDasharray="4"
                    />
                    <Line
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
                            <Line
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
                        <Circle
                            key={`circle-${i}`}
                            cx={scaleX(new Date(d.dateTime).getTime())}
                            cy={scaleY(d.value)}
                            r={3}
                            fill={getPointColor(d.value, minThreshold, maxThreshold)}
                        />
                    ))}
                    {xTicks.map((t, i) => (
                        <SvgText
                            key={`x-label-${i}`}
                            x={scaleX(t)}
                            y={height - padding / 2}
                            fontSize="10"
                            fill="black"
                            textAnchor="middle"
                        >
                            {new Date(t).toLocaleDateString()}
                        </SvgText>
                    ))}
                    {yTicks.map((t, i) => (
                        <SvgText
                            key={`y-label-${i}`}
                            x={leftPadding - 5}
                            y={scaleY(t) + 5}
                            fontSize="10"
                            fill="black"
                            textAnchor="end"
                        >
                            {Math.round(t)}
                        </SvgText>
                    ))}
                    <SvgText
                        x={width - rightPadding + 5}
                        y={scaleY(minThreshold) + 5}
                        fontSize="10"
                        fill="yellow"
                        textAnchor="start"
                    >
                        {minThreshold}
                    </SvgText>
                    <SvgText
                        x={width - rightPadding + 5}
                        y={scaleY(maxThreshold) - 5}
                        fontSize="10"
                        fill="red"
                        textAnchor="start"
                    >
                        {maxThreshold}
                    </SvgText>
                </G>
            </Svg>
        );
    };

    const toggleExpand = (metric: string) => {
        setExpandedMetrics(prevState => ({
            ...prevState,
            [metric]: !prevState[metric]
        }));
    };

    return (
        <View style={{ flex: 1, paddingHorizontal: 16, backgroundColor: '#f0f0f0' }}>
            <ScrollView
                contentContainerStyle={{ paddingTop: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {loadedMetrics.map((metric, index) => (
                    groupedEntries[metric.name] && (
                        <View key={`${metric.name}-${index}`} style={{ marginBottom: 16, backgroundColor: generatePastelColor(metric.name), padding: 16, borderRadius: 10 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>{metric.name}</Text>
                            {renderChart(groupedEntries[metric.name]
                                    .map(entry => ({ dateTime: entry.dateTime, value: entry.value }))
                                    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()),
                                metric.min_threshold,
                                metric.max_threshold
                            )}
                            {expandedMetrics[metric.name] && (
                                <>
                                    <TouchableOpacity onPress={() => toggleExpand(metric.name)} style={{ marginTop: 8, alignItems: 'center' }}>
                                        <Icon name="chevron-up" size={16} color="#007AFF" />
                                    </TouchableOpacity>
                                    {groupedEntries[metric.name]
                                        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
                                        .map((entry, index) => (
                                            <View key={`${entry.dateTime}-${entry.metric}-${index}`} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
                                                <Text style={{ flex: 1, fontSize: 16 }}>{formatDateTime(entry.dateTime)}</Text>
                                                <TextInput
                                                    style={{ borderColor: 'gray', borderWidth: 1, padding: 8, width: 100, borderRadius: 8 }}
                                                    keyboardType="numeric"
                                                    value={entry.value.toString()}
                                                    onChangeText={(value) => handleValueChange(entry.dateTime, entry.metric, value)}
                                                />
                                                <TouchableOpacity onPress={() => handleSave(entry.dateTime, entry.metric, entry.value.toString())} style={{ marginHorizontal: 8 }}>
                                                    <Icon name="save" size={20} color={isDarkMode ? '#888' : '#555'} />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => handleDelete(entry.dateTime, entry.metric, entry.value)} style={{ marginHorizontal: 8 }}>
                                                    <Icon name="trash" size={20} color={isDarkMode ? '#888' : '#555'} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                </>
                            )}
                            <TouchableOpacity onPress={() => toggleExpand(metric.name)} style={{ marginTop: 8, alignItems: 'center' }}>
                                <Icon name={expandedMetrics[metric.name] ? 'chevron-up' : 'chevron-down'} size={16} color="#007AFF" />
                            </TouchableOpacity>
                        </View>
                    )
                ))}
            </ScrollView>
        </View>
    );
};

export default ViewScreen;
