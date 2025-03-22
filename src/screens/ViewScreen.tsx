import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, RefreshControl} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useColorScheme } from 'react-native';
import eventEmitter from '../utils/EventEmitter.ts';

import {
    readMetricValuesFromFile,
    updateMetricValueInFile,
    deleteMetricValueFromFile,
    readMetricsFromFile
} from '../utils/FileUtils.ts';

import { Alert } from 'react-native';
import { generatePastelColor } from "../utils/UIUtils.ts";

import { styles } from "../utils/FontUtils.ts";

import {MyVictoryChart, MySVGChart} from "../utils/ChartUtils.tsx";

const ViewScreen = () => {
    const [entries, setEntries] = useState<{ dateTime: string, metric: string, value: number }[]>([]);
    const isDarkMode = useColorScheme() === 'dark';
    const [refreshing, setRefreshing] = useState(false);
    const [loadedMetrics, setLoadedMetrics] = useState<{ name: string, min_threshold: number, max_threshold: number }[]>([]);
    const [expandedMetrics, setExpandedMetrics] = useState<{ [key: string]: boolean }>({});
    const [editedValues, setEditedValues] = useState<{ [key: string]: string }>({});
    const [originalValues, setOriginalValues] = useState<{ [key: string]: string }>({});
    const [useVictoryChart, setUseVictoryChart] = useState(false);

    const loadEntries = async () => {
        const loadedMericValues = await readMetricValuesFromFile(true);
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

        const handleMetricAdded = () => {
            loadEntries();
        };

        // Update the plots if we add a metric or amend/add any definitions
        eventEmitter.on('metricAdded', handleMetricAdded);
        eventEmitter.on('metricDefinitionsAmended', handleMetricAdded);

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


    const toggleExpand = (metric: string) => {
        setExpandedMetrics(prevState => ({
            ...prevState,
            [metric]: !prevState[metric]
        }));
    };

    const mean = (arr: number[]) => arr.reduce((a, b) => a + b, 0) / arr.length;
    const variance = (arr: number[]) => mean(arr.map(x => x ** 2)) - mean(arr) ** 2;
    const sd = (arr: number[]) => Math.sqrt(variance(arr));

    return (
        <View style={{ flex: 1, paddingHorizontal: 0, backgroundColor: '#f0f0f0' }}>
            <ScrollView
                contentContainerStyle={{ paddingTop: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                keyboardShouldPersistTaps={"always"}
            >
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 8, paddingBottom: 18, paddingRight: 16, backgroundColor: '#f0f0f0', borderBottomWidth: 1, borderBottomColor: 'lightgrey'}}>

                <TouchableOpacity onPress={() => setUseVictoryChart(!useVictoryChart)} style={{ backgroundColor: isDarkMode ? '#444' : '#87CEEB', padding: 8, borderRadius: 8, alignItems: 'center' }}>
                    <Text style={[styles.common_bold, {color: '#000'}]}>{`Switch to ${useVictoryChart ? 'SVG' : 'Victory'} Chart`}</Text>
                </TouchableOpacity>
                </View>

                {loadedMetrics.map((metric, index) => (
                    groupedEntries[metric.name] && (
                        <View key={`${metric.name}-${index}`} style={{ marginBottom: 16, marginHorizontal: 16, backgroundColor: generatePastelColor(metric.name), padding: 8, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 10 }}>
                            <Text style={[styles.common_bold, { marginBottom: 8 }]}>{metric.name} (mean={(mean(groupedEntries[metric.name].map(entry => entry.value))).toFixed(2)}, sd={(sd(groupedEntries[metric.name].map(entry => entry.value))).toFixed(2)})</Text>

                            {useVictoryChart ? (
                                <MyVictoryChart
                                    data={groupedEntries[metric.name]
                                        .map(entry => ({ dateTime: entry.dateTime, value: entry.value }))
                                        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
                                    }
                                    minThreshold={metric.min_threshold}
                                    maxThreshold={metric.max_threshold}
                                />
                            ) : (
                                <MySVGChart
                                    data={groupedEntries[metric.name]
                                        .map(entry => ({ dateTime: entry.dateTime, value: entry.value }))
                                        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
                                    }
                                    minThreshold={metric.min_threshold}
                                    maxThreshold={metric.max_threshold}
                                />
                            )}

                            {expandedMetrics[metric.name] && (
                                <>
                                    <TouchableOpacity onPress={() => toggleExpand(metric.name)} style={{ marginTop: 8, alignItems: 'center', padding: 8 }}>
                                        <Icon name="chevron-up" size={18} color="#007AFF" />
                                    </TouchableOpacity>
                                    {groupedEntries[metric.name]
                                        .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime()) // Sort in reverse order
                                        .map((entry, index) => (
                                            <View key={`${entry.dateTime}-${entry.metric}-${index}`} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
                                                <Text style={[styles.common_regular, { flex: 1}]}>{formatDateTime(entry.dateTime)}</Text>
                                                <TextInput
                                                    style={{ borderColor: 'gray', borderWidth: 1, padding: 2, width: 100, borderRadius: 8 }}
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
                            <TouchableOpacity onPress={() => toggleExpand(metric.name)} style={{ marginTop: 8, alignItems: 'center', padding: 0 }}>
                                <Icon name={expandedMetrics[metric.name] ? 'chevron-up' : 'chevron-down'} size={18} color="#007AFF" />
                            </TouchableOpacity>
                        </View>
                    )
                ))}
            </ScrollView>
        </View>
    );
};

export default ViewScreen;
