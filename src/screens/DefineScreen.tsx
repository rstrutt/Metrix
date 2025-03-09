import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { readMetricsFromFile, saveMetricsToFile } from '../utils/fileUtils.ts';
import Icon from 'react-native-vector-icons/FontAwesome';

const DefineScreen = () => {
    const [metrics, setMetrics] = useState<{ name: string, min_threshold: number, max_threshold: number }[]>([]);
    const [newMetric, setNewMetric] = useState({ name: '', min_threshold: '', max_threshold: '' });
    const [refreshing, setRefreshing] = useState(false);
    const isDarkMode = useColorScheme() === 'dark';

    useEffect(() => {
        const loadMetrics = async () => {
            const metricsArray = await readMetricsFromFile();
            setMetrics(metricsArray);
        };
        loadMetrics();
    }, []);

    const onRefresh = async () => {
        setRefreshing(true);
        const metricsArray = await readMetricsFromFile();
        setMetrics(metricsArray);
        setRefreshing(false);
    };

    const addMetric = () => {
        if (newMetric.name.trim()) {
            const updatedMetrics = [...metrics, { ...newMetric, min_threshold: parseFloat(newMetric.min_threshold), max_threshold: parseFloat(newMetric.max_threshold) }];
            setMetrics(updatedMetrics);
            saveMetricsToFile(updatedMetrics);
            setNewMetric({ name: '', min_threshold: '', max_threshold: '' });
        }
    };

    const updateMetric = (index: number, field: string, value: string) => {
        const updatedMetrics = metrics.map((metric, i) =>
            i === index ? { ...metric, [field]: value } : metric,
        );
        setMetrics(updatedMetrics);
    };

    const saveMetric = () => {
        const parsedMetrics = metrics.map(metric => ({
            ...metric,
            min_threshold: parseFloat(metric.min_threshold),
            max_threshold: parseFloat(metric.max_threshold),
        }));
        saveMetricsToFile(parsedMetrics);
    };

    const deleteMetric = (index: number) => {
        const updatedMetrics = metrics.filter((_, i) => i !== index);
        setMetrics(updatedMetrics);
        saveMetricsToFile(updatedMetrics);
    };

    const moveMetric = (index: number, direction: 'up' | 'down') => {
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= metrics.length) return;
        const updatedMetrics = [...metrics];
        const [movedMetric] = updatedMetrics.splice(index, 1);
        updatedMetrics.splice(newIndex, 0, movedMetric);
        setMetrics(updatedMetrics);
        saveMetricsToFile(updatedMetrics);
    };

    return (
        <View style={{ flex: 1, padding: 16, backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }}>
            <View style={{ flexDirection: 'row', marginBottom: 8 }}>
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
                <TouchableOpacity onPress={addMetric} style={{ backgroundColor: isDarkMode ? '#444' : '#ddd', padding: 12, borderRadius: 8, alignItems: 'center' }}>
                    <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: 16 }}>Add</Text>
                </TouchableOpacity>
            </View>
            <FlatList
                data={metrics}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4, backgroundColor: '#e3e2e2', padding: 4, borderRadius: 10, height: 50 }}>
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
                            <Icon name="save" size={20} color={isDarkMode ? '#888' : '#555'} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteMetric(index)} style={{ marginHorizontal: 4 }}>
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
