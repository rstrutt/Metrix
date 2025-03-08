import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Icon from 'react-native-vector-icons/FontAwesome';
import { useColorScheme } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
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
    const [open, setOpen] = useState(false);

    const loadEntries = async () => {
        // Load the metrics values and the metric names
        const loadedMericValues = await readMetricValuesFromFile();
        const loadedMetrics = await readMetricsFromFile()
        // Store the loaded metric values
        setEntries(loadedMericValues);
        // Build and save a set of metric names to use in the dropdown
        // keeping it in the same order as the metrics file
        const metrics = Array.from(new Set(loadedMericValues.map(entry => entry.metric)));
        // Order metrics in the same order that they are in the metrics file
        metrics.sort((a, b) => loadedMetrics.indexOf(a) - loadedMetrics.indexOf(b));
        setAllMetrics(metrics);
        setSelectedMetrics(metrics); // Select all metrics by default
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
                // dropDownStyle={{ backgroundColor: isDarkMode ? '#333' : '#fff' }}
            />
            <ScrollView
                contentContainerStyle={{ paddingTop: 16 }}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {Object.keys(groupedEntries).map(metric => (
                    <View key={metric} style={{ marginBottom: 16 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>{metric}</Text>
                        <LineChart
                            data={{
                                labels: groupedEntries[metric].map(entry => formatDateTime(entry.dateTime)),
                                datasets: [
                                    {
                                        data: groupedEntries[metric].map(entry => entry.value)
                                    }
                                ]
                            }}
                            width={Dimensions.get('window').width - 32} // from react-native
                            height={220}
                            yLabelsOffset={-10} // Adjust this value to position the label correctly
                            chartConfig={{
                                backgroundColor: '#d3d3d3', // light grey
                                backgroundGradientFrom: '#d3d3d3', // light grey
                                backgroundGradientTo: '#d3d3d3', // light grey
                                decimalPlaces: 2, // optional, defaults to 2dp
                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // black line color
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, // black text color
                                style: {
                                    borderRadius: 16
                                },
                                propsForDots: {
                                    r: '3',
                                }
                            }}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16
                            }}
                        />
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
                ))}
            </ScrollView>
        </View>
    );
};

export default ViewScreen;
