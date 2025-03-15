import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useColorScheme } from 'react-native';

import {
    readMetricValuesFromFile,
    updateMetricValueInFile,
    deleteMetricValueFromFile,
    readMetricsFromFile
} from '../utils/fileUtils.ts';

import { Alert } from 'react-native';
import { generatePastelColor } from "../utils/uiUtils.ts";
import { useChartPressState, CartesianChart, Line, Scatter } from "victory-native";
import { styles } from "../utils/fontUtils.ts";
import { useFont } from "@shopify/react-native-skia";
import inter from "../../assets/fonts/Roboto-Regular.ttf";
import MyChart from "../utils/myChart.tsx";

// function MyChart(data: { dateTime: string, value: number }[], minThreshold: number, maxThreshold: number){
//     const formattedData = data.map(d => ({
//         dateTime: new Date(d.dateTime).getTime(),
//         value: d.value
//     }));
//
//     // 👇 create our chart press state
//     // const { state, isActive } = useChartPressState({ x: 0, y: { highTmp: 0 } });
//
//     const font = useFont(inter);
//
//     return (
//         <View style={{ height: 150, paddingHorizontal: 50}}>
//             <CartesianChart
//                 data={formattedData}
//                 xKey="dateTime"
//                 yKeys={["value"]}
//                 // scale={{ x: "time" }}
//                 // axisOptions={{ font }}
//                 axisOptions={{  }}
//             >
//                 {({ points }) => (
//                     <>
//                         <Line points={points.value} color="gray" strokeWidth={2} />
//                         <Scatter points={points.value} radius={3} style="fill" color="blue" />
//                     </>
//                 )}
//             </CartesianChart>
//         </View>
//     );
// }

const ViewScreen = () => {
    const [entries, setEntries] = useState<{ dateTime: string, metric: string, value: number }[]>([]);
    const isDarkMode = useColorScheme() === 'dark';
    const [refreshing, setRefreshing] = useState(false);
    const [loadedMetrics, setLoadedMetrics] = useState<{ name: string, min_threshold: number, max_threshold: number }[]>([]);
    const [expandedMetrics, setExpandedMetrics] = useState<{ [key: string]: boolean }>({});
    const [editedValues, setEditedValues] = useState<{ [key: string]: string }>({});
    const [originalValues, setOriginalValues] = useState<{ [key: string]: string }>({});

    const loadEntries = async () => {
        const loadedMericValues = await readMetricValuesFromFile();
        const loadedMetrics = await readMetricsFromFile();
        setEntries(loadedMericValues);
        setLoadedMetrics(loadedMetrics);
        const initialEditedValues = loadedMericValues.reduce((acc, entry) => {
            acc[`${entry.dateTime}-${entry.metric}`] = entry.value.toString();
            return acc;
        }, {} as { [key: string]: string });
        setEditedValues(initialEditedValues);
        setOriginalValues(initialEditedValues);
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
        setEditedValues({ ...editedValues, [`${dateTime}-${metric}`]: value });
    };

    const handleSave = async (dateTime: string, metric: string) => {
        const value = editedValues[`${dateTime}-${metric}`];
        if (value === '') {
            Alert.alert('Invalid Input', 'Please enter a value.');
            return;
        }
        const parsedValue = parseFloat(value);
        if (isNaN(parsedValue)) {
            Alert.alert('Invalid Input', 'Please enter a valid number.');
            return;
        }
        const updatedEntry = { dateTime, metric, value: parsedValue };
        try {
            await updateMetricValueInFile(updatedEntry);
            setEntries(entries.map(entry =>
                entry.dateTime === dateTime && entry.metric === metric
                    ? { ...entry, value: parsedValue }
                    : entry
            ));
            setOriginalValues({ ...originalValues, [`${dateTime}-${metric}`]: value });
        } catch (error) {
            Alert.alert("Error", "There was an error saving the metric entry.");
        }
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

    // const renderChart = (data: { dateTime: string, value: number }[], minThreshold: number, maxThreshold: number) => {
    //
    //     const formattedData = data.map(d => ({
    //         dateTime: new Date(d.dateTime).getTime(),
    //         value: d.value
    //     }));
    //
    //     // 👇 create our chart press state
    //     // const { state, isActive } = useChartPressState({ x: 0, y: { highTmp: 0 } });
    //
    //     return (
    //         <View style={{ height: 150 }}>
    //             <CartesianChart
    //                 data={formattedData}
    //                 xKey="dateTime"
    //                 yKeys={["value"]}
    //                 // scale={{ x: "time" }}
    //                 // axisOptions={{ font }}
    //                 axisOptions={{  }}
    //             >
    //                     {({ points }) => (
    //                         <>
    //                         <Line points={points.value} color="gray" strokeWidth={2} />
    //                         <Scatter points={points.value} radius={3} style="fill" color="blue" />
    //                         </>
    //                     )}
    //             </CartesianChart>
    //         </View>
    //     );
    // };

    const toggleExpand = (metric: string) => {
        setExpandedMetrics(prevState => ({
            ...prevState,
            [metric]: !prevState[metric]
        }));
    };

    return (
        <View style={{ flex: 1, paddingHorizontal: 0, backgroundColor: '#f0f0f0' }}>
            <ScrollView
                contentContainerStyle={{ paddingTop: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {loadedMetrics.map((metric, index) => (
                    groupedEntries[metric.name] && (
                        <View key={`${metric.name}-${index}`} style={{ marginBottom: 16, marginHorizontal: 16, backgroundColor: generatePastelColor(metric.name), padding: 16, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 10 }}>
                            <Text style={[styles.common_bold, { marginBottom: 8 }]}>{metric.name}</Text>
                            <MyChart
                                data={groupedEntries[metric.name]
                                    .map(entry => ({ dateTime: entry.dateTime, value: entry.value }))
                                    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
                                }
                                minThreshold={metric.min_threshold}
                                maxThreshold={metric.max_threshold}
                            />
                            {expandedMetrics[metric.name] && (
                                <>
                                    <TouchableOpacity onPress={() => toggleExpand(metric.name)} style={{ marginTop: 8, alignItems: 'center', padding: 8 }}>
                                        <Icon name="chevron-up" size={16} color="#007AFF" />
                                    </TouchableOpacity>
                                    {groupedEntries[metric.name]
                                        .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()) // Sort in reverse order
                                        .map((entry, index) => (
                                            <View key={`${entry.dateTime}-${entry.metric}-${index}`} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
                                                <Text style={[styles.common_regular, { flex: 1}]}>{formatDateTime(entry.dateTime)}</Text>
                                                <TextInput
                                                    style={{ borderColor: 'gray', borderWidth: 1, padding: 8, width: 100, borderRadius: 8 }}
                                                    keyboardType="numeric"
                                                    value={editedValues[`${entry.dateTime}-${entry.metric}`] || ''}
                                                    onChangeText={(value) => handleValueChange(entry.dateTime, entry.metric, value)}
                                                />
                                                <TouchableOpacity onPress={() => handleSave(entry.dateTime, entry.metric)} style={{ marginHorizontal: 8 }}>
                                                    <Icon name="save" size={20} color={editedValues[`${entry.dateTime}-${entry.metric}`] !== originalValues[`${entry.dateTime}-${entry.metric}`] ? '#007AFF' : (isDarkMode ? '#888' : '#555')} />
                                                </TouchableOpacity>
                                                <TouchableOpacity onPress={() => handleDelete(entry.dateTime, entry.metric, entry.value)} style={{ marginHorizontal: 8 }}>
                                                    <Icon name="trash" size={20} color={isDarkMode ? '#888' : '#555'} />
                                                </TouchableOpacity>
                                            </View>
                                        ))}
                                </>
                            )}
                            <TouchableOpacity onPress={() => toggleExpand(metric.name)} style={{ marginTop: 8, alignItems: 'center', padding: 8 }}>
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
