import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Text, TextInput, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColorScheme } from 'react-native';
import { readMetricsFromFile, saveMetricValuesToFile } from '../utils/fileUtils.ts';
import { generatePastelColor } from "../utils/uiUtils.ts";
import { styles } from "../utils/fontUtils.ts";
import eventEmitter from '../utils/eventEmitter';


import Icon from "react-native-vector-icons/FontAwesome";

const AddScreen = () => {
    const [metrics, setMetrics] = useState<{ name: string, min_threshold: number, max_threshold: number }[]>([]);
    const [metricValues, setMetricValues] = useState<{ [key: string]: string }>({});
    const [date, setDate] = useState(new Date());
    const [dateString, setDateString] = useState(date.toLocaleDateString('en-CA'));
    const [timeString, setTimeString] = useState(date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })); // Only hours and minutes
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

        // If we add, delete, amend any metric definitions then reload the metrics for this screen
        eventEmitter.on('metricDefinitionsAmended', loadMetrics);

    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        await loadMetrics();
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-CA'); // 'en-CA' locale ensures 'yyyy-mm-dd' format
        const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); // 'hh:mm' format
        setDateString(formattedDate);
        setTimeString(formattedTime);
        setDate(now);
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

        eventEmitter.emit('metricAdded'); // Emit the event so other tabs can upadate
    };

    const handleDateChange = (event: any, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDateString(selectedDate.toLocaleDateString('en-CA')); // 'en-CA' locale ensures 'yyyy-mm-dd' format in the current timezone
        }
    };

    const handleTimeChange = (event: any, selectedTime?: Date) => {
        setShowTimePicker(false);
        if (selectedTime) {
            setTimeString(selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })); // 'hh:mm' format
        }
    };

    const setCurrentTime = () => {
        const now = new Date();
        const formattedDate = now.toLocaleDateString('en-CA'); // 'en-CA' locale ensures 'yyyy-mm-dd' format in the current timezone
        const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }); // 'hh:mm' format
        setDateString(formattedDate);
        setTimeString(formattedTime);
    };

    const isSaveButtonEnabled = () => {
        return Object.values(metricValues).some(value => value.trim() !== '');
    };

    return (
        <View style={{ flex: 1, padding: 0, backgroundColor: '#f0f0f0'}}>
            <View style={{ flexDirection: 'row', marginBottom: 8, padding: 16, backgroundColor: '#f0f0f0', borderBottomWidth: 1, borderBottomColor: 'lightgrey'}}>
                <View style={{ flexDirection: 'row', flex: 1 }}>
                    <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ marginRight: 8 }}>
                        <Text style={{ width: 110, padding: 8, borderColor: 'gray', borderWidth: 1, borderRadius: 8, textAlign: 'center', backgroundColor: '#f0f0f0', shadowColor: '#000', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 2 }}>
                            {dateString}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setShowTimePicker(true)} style={{ marginRight: 8 }}>
                        <Text style={{ width: 75, padding: 8, borderColor: 'gray', borderWidth: 1, borderRadius: 8, textAlign: 'center', backgroundColor: '#f0f0f0', shadowColor: '#000', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 2 }}>
                            {timeString}
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={setCurrentTime} style={{ backgroundColor: isDarkMode ? '#444' : '#87CEEB', padding: 8, borderRadius: 8, alignItems: 'center' }}>
                        <Text style={[styles.common_bold, {color: '#000'}]}>Now</Text>
                    </TouchableOpacity>
                </View>
                <TouchableOpacity onPress={isSaveButtonEnabled() ? handleSave : undefined} style={{ backgroundColor: isSaveButtonEnabled() ? (isDarkMode ? '#444' : '#87CEEB') : '#888', padding: 8, borderRadius: 8, justifyContent: 'center', alignItems: 'center'}}>
                    <Icon name="plus" size={15} color="#000"/>
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
                    <View key={metric.name} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4, backgroundColor: generatePastelColor(metric.name), padding: 8, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 10 }}>
                        {/*<Text style={{ flex: 1, fontSize: 16, fontFamily: 'sans-serif-thin'}}>{metric.name}</Text>*/}
                        {/*<Text style={{ flex: 1, fontSize: 16}}>{metric.name}</Text>*/}
                        <Text style={[styles.common_bold, { flex: 1}]}>{metric.name}</Text>
                        <TextInput
                            ref={(ref) => {
                                inputRefs.current[index] = ref!;
                            }}
                            style={{ borderColor: 'gray', borderWidth: 1, padding: 2, width: 100, borderRadius: 8 }}
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
