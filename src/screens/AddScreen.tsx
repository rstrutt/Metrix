import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColorScheme } from 'react-native';
import { readMetricsFromFile, saveMetricValuesToFile } from '../utils/fileUtils.ts';
import { generatePastelColor } from "../utils/uiUtils.ts";

const AddScreen = () => {
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

        const combinedDateTimeString = `${dateString} ${timeString}`;
        const parsedMetricValues = Object.fromEntries(
            Object.entries(metricValues).map(([metric, value]) => [metric, parseFloat(value)])
        );
        await saveMetricValuesToFile(parsedMetricValues, combinedDateTimeString);
        // Clear all input fields
        setMetricValues({});
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

    const isSaveButtonEnabled = () => {
        return Object.values(metricValues).some(value => value.trim() !== '');
    };

    return (
        <View style={{ flex: 1}}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', padding: 16, backgroundColor: '#f0f0f0' }}>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ width: 110, padding: 12, borderColor: 'gray', borderWidth: 1, borderRadius: 8, textAlign: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 2 }}>
                        {dateString}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowTimePicker(true)} style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ width: 75, padding: 12, borderColor: 'gray', borderWidth: 1, borderRadius: 8, textAlign: 'center', backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 2 }}>
                        {timeString}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={setCurrentTime} style={{ backgroundColor: isDarkMode ? '#444' : '#87CEEB', padding: 12, borderRadius: 8, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 16 }}>Now</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={isSaveButtonEnabled() ? handleSave : undefined} style={{ backgroundColor: isSaveButtonEnabled() ? (isDarkMode ? '#444' : '#87CEEB') : '#888', marginLeft: 10, padding: 12, borderRadius: 8, alignItems: 'center' }}>
                    <Text style={{ color: '#fff', fontSize: 16 }} numberOfLines={1}>   +   </Text>
                </TouchableOpacity>
            </View>
            <ScrollView
                style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 0, backgroundColor: '#f0f0f0'}} // Light grey background
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
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
                    <View key={metric.name} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8, backgroundColor: generatePastelColor(metric.name), padding: 12, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 10 }}>
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
            </ScrollView>
        </View>
    );
};

export default AddScreen;
