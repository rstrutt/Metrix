import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColorScheme } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { readMetricsFromFile, saveMetricValuesToFile } from '../utils/fileUtils.ts';

const EntryScreen = () => {
    const [metrics, setMetrics] = useState<{ name: string, min_threshold: number, max_threshold: number }[]>([]);
    const [metricValues, setMetricValues] = useState<{ [key: string]: string }>({});
    const [date, setDate] = useState(new Date());
    const [dateString, setDateString] = useState(date.toISOString().split('T')[0]);
    const [timeString, setTimeString] = useState(date.toTimeString().split(' ')[0].slice(0, 5)); // Only hours and minutes
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const isDarkMode = useColorScheme() === 'dark';
    const inputRefs = useRef<TextInput[]>([]);

    const loadMetrics = async () => {
        const metricsArray = await readMetricsFromFile();
        setMetrics(metricsArray);
    };

    useEffect(() => {
        loadMetrics();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadMetrics();
        const now = new Date();
        setDate(now);
        setDateString(now.toISOString().split('T')[0]);
        setTimeString(now.toTimeString().split(' ')[0].slice(0, 5));
        setRefreshing(false);
    };

    const handleValueChange = (metric: string, value: string) => {
        setMetricValues({ ...metricValues, [metric]: value });
    };

    const handleSave = async () => {
        const invalidMetrics = Object.entries(metricValues).filter(([_metric, value]) => isNaN(parseFloat(value)));
        if (invalidMetrics.length > 0) {
            Alert.alert('Invalid Input', 'Please enter valid numbers for all metrics.');
            return;
        }

        const combinedDateTime = new Date(`${dateString}T${timeString}`);
        const parsedMetricValues = Object.fromEntries(
            Object.entries(metricValues).map(([metric, value]) => [metric, parseFloat(value)])
        );
        await saveMetricValuesToFile(parsedMetricValues, combinedDateTime.toISOString());
        // Clear all input fields
        setMetricValues({});
        setDate(new Date());
        setDateString(new Date().toISOString().split('T')[0]);
        setTimeString(new Date().toTimeString().split(' ')[0].slice(0, 5));
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDateString(selectedDate.toISOString().split('T')[0]);
        }
    };

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime) {
            setTimeString(selectedTime.toTimeString().split(' ')[0].slice(0, 5)); // Only hours and minutes
        }
    };

    const setCurrentTime = () => {
        const now = new Date();
        const formattedDateTime = now.toISOString().split('T')[0] + ' ' + now.toTimeString().split(' ')[0].slice(0, 5);
        setDateString(formattedDateTime.split(' ')[0]);
        setTimeString(formattedDateTime.split(' ')[1]);
    };

    return (
        <ScrollView
            style={{ flex: 1, padding: 16, backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ padding: 12, borderColor: 'gray', borderWidth: 1, borderRadius: 8, textAlign: 'center' }}>
                        {dateString}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowTimePicker(true)} style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ padding: 12, borderColor: 'gray', borderWidth: 1, borderRadius: 8, textAlign: 'center' }}>
                        {timeString}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={setCurrentTime} style={{ backgroundColor: isDarkMode ? '#444' : '#ddd', padding: 12, borderRadius: 8, alignItems: 'center' }}>
                    <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: 16 }}>Now</Text>
                </TouchableOpacity>
            </View>
            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                />
            )}
            {showTimePicker && (
                <DateTimePicker
                    value={date}
                    mode="time"
                    display="default"
                    onChange={handleTimeChange}
                />
            )}
            {metrics.map((metric, index) => (
                <View key={metric.name} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4, backgroundColor: '#e3e2e2', padding: 4, borderRadius: 10}}>
                    <Text style={{ flex: 1, fontSize: 16 }}>{metric.name}</Text>
                    <TextInput
                        ref={(ref) => {
                            inputRefs.current[index] = ref!;
                        }}
                        style={{ borderColor: 'gray', borderWidth: 1, padding: 8, width: 100, borderRadius: 8 }}
                        keyboardType="numeric"
                        value={metricValues[metric.name] || ''}
                        onChangeText={(value) => handleValueChange(metric.name, value)}
                        returnKeyType={index === metrics.length - 1 ? 'done' : 'next'}
                        onSubmitEditing={() => {
                            if (index < metrics.length - 1) {
                                inputRefs.current[index + 1].focus();
                            }
                        }}
                    />
                </View>
            ))}
            <TouchableOpacity onPress={handleSave} style={{ backgroundColor: isDarkMode ? '#444' : '#ddd', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 }}>
                <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: 16 }}>Save</Text>
            </TouchableOpacity>
            <View style={{ height: 50 }} />
        </ScrollView>
    );
};

export default EntryScreen;
