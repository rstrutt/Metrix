import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ScrollView, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useColorScheme } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { readMetricsFromFile, saveMetricValuesToFile } from './fileUtils';

const EntryScreen = () => {
    const [metrics, setMetrics] = useState<string[]>([]);
    const [metricValues, setMetricValues] = useState<{ [key: string]: number }>({});
    const [date, setDate] = useState(new Date());
    const [dateString, setDateString] = useState(date.toISOString().split('T')[0]);
    const [timeString, setTimeString] = useState(date.toTimeString().split(' ')[0].slice(0, 5)); // Only hours and minutes
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);
    const isDarkMode = useColorScheme() === 'dark';

    useEffect(() => {
        const loadMetrics = async () => {
            const metricsArray = await readMetricsFromFile();
            setMetrics(metricsArray);
        };
        loadMetrics();
    }, []);

    const handleValueChange = (metric: string, value: string) => {
        const floatValue = parseFloat(value);
        if (!isNaN(floatValue)) {
            setMetricValues({ ...metricValues, [metric]: floatValue });
        }
    };

    const handleSave = async () => {
        const combinedDateTime = new Date(`${dateString}T${timeString}`);
        await saveMetricValuesToFile(metricValues, combinedDateTime.toISOString());
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

    return (
        <ScrollView style={{ flex: 1, padding: 16, backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <TouchableOpacity onPress={() => setShowDatePicker(true)} style={{ flex: 1, marginRight: 8 }}>
                    <Text style={{ padding: 8, borderColor: 'gray', borderWidth: 1 }}>
                        {dateString}
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowTimePicker(true)} style={{ flex: 1 }}>
                    <Text style={{ padding: 8, borderColor: 'gray', borderWidth: 1 }}>
                        {timeString}
                    </Text>
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
            {metrics.map((metric) => (
                <View key={metric} style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8 }}>
                    <Text style={{ flex: 1 }}>{metric}</Text>
                    <TextInput
                        style={{ borderColor: 'gray', borderWidth: 1, padding: 8, width: 100 }}
                        keyboardType="numeric"
                        onChangeText={(value) => handleValueChange(metric, value)}
                    />
                </View>
            ))}
            <Button title="Save" onPress={handleSave} />
        </ScrollView>
    );
};

export default EntryScreen;
