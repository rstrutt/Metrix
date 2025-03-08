import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, RefreshControl, Dimensions } from 'react-native';
import MultiSelect from 'react-native-multiple-select';
import Icon from 'react-native-vector-icons/FontAwesome';
import { LineChart, BarChart } from 'react-native-chart-kit';
import { readMetricValuesFromFile, updateMetricValueInFile, deleteMetricValueFromFile } from './fileUtils';

const ViewScreen = () => {
    const [entries, setEntries] = useState<{ dateTime: string, metric: string, value: number }[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedMetrics, setSelectedMetrics] = useState<string[]>([]);
    const [allMetrics, setAllMetrics] = useState<string[]>([]);

    const loadEntries = async () => {
        const loadedEntries = await readMetricValuesFromFile();
        setEntries(loadedEntries);
        const metrics = Array.from(new Set(loadedEntries.map(entry => entry.metric)));
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

    const handleValueChange = (index: number, value: string) => {
        const updatedEntries = [...entries];
        updatedEntries[index].value = parseFloat(value);
        setEntries(updatedEntries);
    };

    const handleSave = async (index: number) => {
        const updatedEntry = entries[index];
        await updateMetricValueInFile(updatedEntry);
    };

    const handleDelete = async (index: number) => {
        const { dateTime, metric } = entries[index];
        await deleteMetricValueFromFile(dateTime, metric);
        setEntries(entries.filter((_, i) => i !== index));
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
            <MultiSelect
                items={allMetrics.map(metric => ({ id: metric, name: metric }))}
                uniqueKey="id"
                onSelectedItemsChange={setSelectedMetrics}
                selectedItems={selectedMetrics}
                selectText="Select Metrics"
                searchInputPlaceholderText="Search Metrics..."
                tagRemoveIconColor="#CCC"
                tagBorderColor="#CCC"
                tagTextColor="#CCC"
                selectedItemTextColor="#CCC"
                selectedItemIconColor="#CCC"
                itemTextColor="#000"
                displayKey="name"
                searchInputStyle={{ color: '#CCC' }}
                submitButtonColor="#CCC"
                submitButtonText="Submit"
            />
            <ScrollView
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                {Object.keys(groupedEntries).map(metric => (
                    <View key={metric} style={{ marginBottom: 16 }}>
                        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>{metric}</Text>
                        {/*<BarChart*/}
                        {/*    // style={graphStyle}*/}
                        {/*    data={{*/}
                        {/*        labels: ['January', 'February', 'March', 'April', 'May', 'June'],*/}
                        {/*        datasets: [*/}
                        {/*            {*/}
                        {/*                data: [20, 45, 28, 80, 99, 43],*/}
                        {/*            },*/}
                        {/*        ],*/}
                        {/*    }}*/}
                        {/*    width={100}*/}
                        {/*    height={220}*/}
                        {/*    yAxisLabel={'$'}*/}
                        {/*    chartConfig={{*/}
                        {/*        backgroundColor: '#e26a00',*/}
                        {/*        backgroundGradientFrom: '#fb8c00',*/}
                        {/*        backgroundGradientTo: '#ffa726',*/}
                        {/*        decimalPlaces: 2, // optional, defaults to 2dp*/}
                        {/*        color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,*/}
                        {/*        style: {*/}
                        {/*            borderRadius: 16*/}
                        {/*        }*/}
                        {/*    }}*/}
                        {/*    yAxisSuffix="xx"*/}
                        {/*/>*/}
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
                            // yAxisLabel={`${metric} `}
                            // yAxisSuffix=""
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
                                    // strokeWidth: '2',
                                    // stroke: '#ffa726'
                                }
                            }}
                            bezier
                            style={{
                                marginVertical: 8,
                                borderRadius: 16
                            }}
                        />
                        {groupedEntries[metric].map((entry, index) => (
                            <View key={`${entry.dateTime}-${entry.metric}`} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
                                <Text style={{ flex: 1 }}>{formatDateTime(entry.dateTime)}</Text>
                                <TextInput
                                    style={{ borderColor: 'gray', borderWidth: 1, paddingLeft: 4, paddingRight: 4, width: 50 }}
                                    keyboardType="numeric"
                                    value={entry.value.toString()}
                                    onChangeText={(value) => handleValueChange(index, value)}
                                />
                                <TouchableOpacity onPress={() => handleSave(index)} style={{ marginHorizontal: 8 }}>
                                    <Icon name="save" size={20} color="blue" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => handleDelete(index)} style={{ marginHorizontal: 8 }}>
                                    <Icon name="trash" size={20} color="red" />
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
