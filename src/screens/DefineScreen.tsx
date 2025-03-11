import React, { useState, useEffect } from 'react';
import { Alert, View, Text, TextInput, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { useColorScheme } from 'react-native';
import { readMetricsFromFile, saveMetricsToFile } from '../utils/fileUtils.ts';
import Icon from 'react-native-vector-icons/FontAwesome';
import { generatePastelColor } from "../utils/uiUtils.ts";

const DefineScreen = () => {
    const [metrics, setMetrics] = useState<{ name: string, min_threshold: number, max_threshold: number }[]>([]);
    const [newMetric, setNewMetric] = useState({ name: '', min_threshold: '', max_threshold: '' });
    const [refreshing, setRefreshing] = useState(false);
    const [originalMetrics, setOriginalMetrics] = useState<{ name: string, min_threshold: number, max_threshold: number }[]>([]);
    const isDarkMode = useColorScheme() === 'dark';

    useEffect(() => {
        const loadMetrics = async () => {
            const metricsArray = await readMetricsFromFile();
            setMetrics(metricsArray);
            setOriginalMetrics(metricsArray);
        };
        loadMetrics();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        const metricsArray = await readMetricsFromFile();
        setMetrics(metricsArray);
        setOriginalMetrics(metricsArray);
        setRefreshing(false);
    };

    const addMetric = () => {
        if (newMetric.name.trim() && newMetric.min_threshold.trim() && newMetric.max_threshold.trim()) {
            const updatedMetrics = [...metrics, { ...newMetric, min_threshold: parseFloat(newMetric.min_threshold), max_threshold: parseFloat(newMetric.max_threshold) }];
            setMetrics(updatedMetrics);
            saveMetricsToFile(updatedMetrics);
            setNewMetric({ name: '', min_threshold: '', max_threshold: '' });
        } else {
            Alert.alert('Invalid Input', 'Please enter valid values for all fields.');
        }
    };

    const updateMetric = (index: number, field: string, value: string) => {
        if (index >= 0 && index < metrics.length) {
            const updatedMetrics = metrics.map((metric, i) =>
                i === index ? { ...metric, [field]: value } : metric,
            );
            setMetrics(updatedMetrics);
        }
    };

    const saveMetric = () => {
        const parsedMetrics = metrics.map(metric => ({
            ...metric,
            min_threshold: parseFloat(metric.min_threshold.toString()),
            max_threshold: parseFloat(metric.max_threshold.toString()),
        }));
        try {
            saveMetricsToFile(parsedMetrics);
            setOriginalMetrics(parsedMetrics);
        } catch (error) {
            Alert.alert("Error", "There was an error saving the metrics.");
        }
    };

    const deleteMetric = (index: number) => {
        if (index >= 0 && index < metrics.length) {
            const updatedMetrics = metrics.filter((_, i) => i !== index);
            setMetrics(updatedMetrics);
            saveMetricsToFile(updatedMetrics);
        }
    };

    const moveMetric = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex >= 0 && newIndex < metrics.length) {
            const updatedMetrics = [...metrics];
            const [movedMetric] = updatedMetrics.splice(index, 1);
            updatedMetrics.splice(newIndex, 0, movedMetric);
            setMetrics(updatedMetrics);
            saveMetricsToFile(updatedMetrics);
        }
    };

    const handleDeleteMetric = (index: number) => {
        Alert.alert(
            "Confirm Deletion",
            `Are you sure you want to delete the metric?`,
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Delete",
                    onPress: async () => {
                        deleteMetric(index);
                    },
                    style: "destructive"
                }
            ]
        );
    };

    const isMetricChanged = (index: number) => {
        if (index >= originalMetrics.length) {
            return false;
        }
        if (index >= 0 && index < originalMetrics.length && index < metrics.length) {
            const originalMetric = originalMetrics[index];
            const currentMetric = metrics[index];
            return originalMetric.min_threshold.toString() !== currentMetric.min_threshold.toString() ||
                originalMetric.max_threshold.toString() !== currentMetric.max_threshold.toString();
        }
        return false;
    };

    const isAddButtonEnabled = () => {
        return newMetric.name.trim() !== '' && newMetric.min_threshold.trim() !== '' && newMetric.max_threshold.trim() !== '';
    };

    return (
        <View style={{ flex: 1, padding: 0, backgroundColor: '#f0f0f0' }}>
            <View style={{ flexDirection: 'row', marginBottom: 8, padding:16}}>
                <TextInput
                    value={newMetric.name}
                    onChangeText={(text) => setNewMetric({ ...newMetric, name: text })}
                    placeholder="Metric Name"
                    style={{ borderColor: 'gray', borderWidth: 1, flex: 1, marginRight: 8, padding: 8, borderRadius: 8 }}
                />
                <TextInput
                    value={newMetric.min_threshold}
                    onChangeText={(text) => setNewMetric({ ...newMetric, min_threshold: text })}
                    placeholder="Min"
                    keyboardType="numeric"
                    style={{ borderColor: 'gray', borderWidth: 1, width: 60, marginRight: 8, padding: 8, borderRadius: 8 }}
                />
                <TextInput
                    value={newMetric.max_threshold}
                    onChangeText={(text) => setNewMetric({ ...newMetric, max_threshold: text })}
                    placeholder="Max"
                    keyboardType="numeric"
                    style={{ borderColor: 'gray', borderWidth: 1, width: 60, marginRight: 8, padding: 8, borderRadius: 8 }}
                />
                <TouchableOpacity onPress={isAddButtonEnabled() ? addMetric : undefined} style={{ backgroundColor: isAddButtonEnabled() ? (isDarkMode ? '#444' : '#87CEEB') : '#888', padding: 12, borderRadius: 8, alignItems: 'center' }}>
                    <Icon name="plus" size={20} color="#fff" />
                </TouchableOpacity>
            </View>
            <FlatList
                data={metrics}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 8, marginHorizontal: 16, backgroundColor: generatePastelColor(item.name), padding: 12, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 10 }}>
                        <Text style={{ flex: 1, fontSize: 16 }}>{item.name}</Text>
                        <TextInput
                            value={item.min_threshold.toString()}
                            onChangeText={(text) => updateMetric(index, 'min_threshold', text)}
                            keyboardType="numeric"
                            style={{ borderColor: 'gray', borderWidth: 1, width: 60, marginRight: 4, padding: 8, borderRadius: 8 }}
                        />
                        <TextInput
                            value={item.max_threshold.toString()}
                            onChangeText={(text) => updateMetric(index, 'max_threshold', text)}
                            keyboardType="numeric"
                            style={{ borderColor: 'gray', borderWidth: 1, width: 60, marginRight: 4, padding: 8, borderRadius: 8 }}
                        />
                        <TouchableOpacity onPress={() => moveMetric(index, 'up')} style={{ marginHorizontal: 4 }}>
                            <Icon name="arrow-up" size={20} color={isDarkMode ? '#888' : '#555'} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => moveMetric(index, 'down')} style={{ marginHorizontal: 4 }}>
                            <Icon name="arrow-down" size={20} color={isDarkMode ? '#888' : '#555'} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => saveMetric()} style={{ marginHorizontal: 4 }}>
                            <Icon name="save" size={20} color={isMetricChanged(index) ? '#007AFF' : (isDarkMode ? '#888' : '#555')} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => handleDeleteMetric(index)} style={{ marginHorizontal: 4 }}>
                            <Icon name="trash" size={20} color={isDarkMode ? '#888' : '#555'} />
                        </TouchableOpacity>
                    </View>
                )}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            />
        </View>
    );
};

export default DefineScreen;
