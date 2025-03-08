import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useColorScheme } from 'react-native';
import { Svg, Line, G, Text as SvgText, Rect, Circle } from 'react-native-svg';
import {
    readMetricValuesFromFile,
    updateMetricValueInFile,
    deleteMetricValueFromFile,
    readMetricsFromFile
} from '../fileUtils.ts';

const ViewScreen = () => {
    const [entries, setEntries] = useState<{ dateTime: string, metric: string, value: number }[]>([]);
    const isDarkMode = useColorScheme() === 'dark';
    const [refreshing, setRefreshing] = useState(false);
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
    const [allMetrics, setAllMetrics] = useState<string[]>([]);
    const [loadedMetrics, setLoadedMetrics] = useState<string[]>([]);
    const [open, setOpen] = useState(false);

    const loadEntries = async () => {
        const loadedMericValues = await readMetricValuesFromFile();
        const loadedMetrics = await readMetricsFromFile();
        setEntries(loadedMericValues);
        const metrics = Array.from(new Set(loadedMericValues.map(entry => entry.metric)));
        metrics.sort((a, b) => loadedMetrics.indexOf(a) - loadedMetrics.indexOf(b));
        setAllMetrics(metrics);
        setSelectedMetrics(metrics);
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

    const handleSave = async (dateTime: string, metric: string, value: number) => {
        const updatedEntry = { dateTime, metric, value };
        await updateMetricValueInFile(updatedEntry);
    };

    const handleDelete = async (dateTime: string, metric: string, value: number) => {
        await deleteMetricValueFromFile(dateTime, metric, value);
        setEntries(entries.filter(entry => !(entry.dateTime === dateTime && entry.metric === metric)));
    };

    const formatDateTime = (dateTime: string) => {
        const date = new Date(dateTime);
        const formattedDate = date.toISOString().split('T')[0];
        const formattedTime = date.toTimeString().split(' ')[0].slice(0, 5);
        return `${formattedDate} ${formattedTime}`;
    };

    const filteredEntries = entries.filter(entry => selectedMetrics.includes(entry.metric));

    const groupedEntries = filteredEntries.reduce((acc, entry) => {
        if (!acc[entry.metric]) {
            acc[entry.metric] = [];
        }
        acc[entry.metric].push(entry);
        return acc;
    }, {} as { [key: string]: { dateTime: string, metric: string, value: number }[] });

    const renderChart = (data: { dateTime: string, value: number }[]) => {
        const width = Dimensions.get('window').width - 32;
        const height = 220;
        const padding = 20;
        const leftPadding = 30; // Increased left padding
        const xMin = Math.min(...data.map(d => new Date(d.dateTime).getTime()));
        const xMax = Math.max(...data.map(d => new Date(d.dateTime).getTime()));
        const yMin = Math.min(...data.map(d => d.value));
        const yMax = Math.max(...data.map(d => d.value));

        const scaleX = (value: number) => ((value - xMin) / (xMax - xMin)) * (width - leftPadding - padding) + leftPadding;
        const scaleY = (value: number) => height - ((value - yMin) / (yMax - yMin)) * (height - 2 * padding) - padding;

        const xTicks = Array.from({ length: 6 }, (_, i) => xMin + (i * (xMax - xMin)) / 5);
        const yTicks = Array.from({ length: 5 }, (_, i) => yMin + (i * (yMax - yMin)) / 4);

        return (
            <Svg width={width} height={height}>
                <Rect x="0" y="0" width={width} height={height} fill="#d3d3d3" rx="10" ry="10" />
                <G>
                    {/* Grid Lines */}
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
                    {/* X-Axis */}
                    <Line
                        x1={leftPadding}
                        y1={height - padding}
                        x2={width - padding}
                        y2={height - padding}
                        stroke="black"
                        strokeWidth="2"
                    />
                    {/* Y-Axis */}
                    <Line
                        x1={leftPadding}
                        y1={padding}
                        x2={leftPadding}
                        y2={height - padding}
                        stroke="black"
                        strokeWidth="2"
                    />
                    {/* Data Lines */}
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
                    {/* Data Points */}
                    {data.map((d, i) => (
                        <Circle
                            key={`circle-${i}`}
                            cx={scaleX(new Date(d.dateTime).getTime())}
                            cy={scaleY(d.value)}
                            r={3}
                            fill="black"
                        />
                    ))}
                    {/* X-Axis Labels */}
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
                    {/* Y-Axis Labels */}
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
                </G>
            </Svg>
        );
    };

    return (
        <View style={{ flex: 1, padding: 16 }}>
            <DropDownPicker
                open={open}
                value={selectedMetrics}
                items={allMetrics.map(metric => ({ label: metric, value: metric }))}
                setOpen={setOpen}
                setValue={setSelectedMetrics}
                setItems={setAllMetrics}
                multiple={true}
                min={0}
                max={allMetrics.length}
                placeholder="Select Metrics"
                containerStyle={{ height: 40 }}
                style={{ backgroundColor: isDarkMode ? '#333' : '#fff' }}
                dropDownContainerStyle={{ backgroundColor: isDarkMode ? '#333' : '#fff' }}
            />
            <ScrollView
                contentContainerStyle={{ paddingTop: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {loadedMetrics.map(metric => (
                    groupedEntries[metric] && (
                        <View key={metric} style={{ marginBottom: 16, backgroundColor: '#e3e2e2', padding: 16, borderRadius: 10 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>{metric}</Text>
                            {renderChart(groupedEntries[metric].map(entry => ({ dateTime: entry.dateTime, value: entry.value })))}
                            {groupedEntries[metric].map((entry) => (
                                <View key={`${entry.dateTime}-${entry.metric}`} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
                                    <Text style={{ flex: 1 , fontSize: 16}}>{formatDateTime(entry.dateTime)}</Text>
                                    <TextInput
                                        style={{ borderColor: 'gray', borderWidth: 1, padding: 8, width: 100, borderRadius: 8 }}
                                        keyboardType="numeric"
                                        value={entry.value.toString()}
                                        onChangeText={(value) => handleValueChange(entry.dateTime, entry.metric, value)}
                                    />
                                    <TouchableOpacity onPress={() => handleSave(entry.dateTime, entry.metric, entry.value)} style={{ marginHorizontal: 8 }}>
                                        <Icon name="save" size={20} color={isDarkMode ? '#888' : '#555'} />
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={() => handleDelete(entry.dateTime, entry.metric, entry.value)} style={{ marginHorizontal: 8 }}>
                                        <Icon name="trash" size={20} color={isDarkMode ? '#888' : '#555'} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )
                ))}
            </ScrollView>
        </View>
    );
};

export default ViewScreen;
