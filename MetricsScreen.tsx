import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { readMetricsFromFile, saveMetricsToFile } from './fileUtils';

const MetricsScreen = () => {
    const [metrics, setMetrics] = useState<string[]>([]);
    const [newMetric, setNewMetric] = useState('');
    const isDarkMode = useColorScheme() === 'dark';

    useEffect(() => {
        const loadMetrics = async () => {
            const metricsArray = await readMetricsFromFile();
            setMetrics(metricsArray);
        };
        loadMetrics();
    }, []);

    const addMetric = () => {
        if (newMetric.trim()) {
            const updatedMetrics = [...metrics, newMetric.trim()];
            setMetrics(updatedMetrics);
            saveMetricsToFile(updatedMetrics);
            setNewMetric('');
        }
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
            <TextInput
                value={newMetric}
                onChangeText={setNewMetric}
                placeholder="Add new metric"
                style={{ borderColor: 'gray', borderWidth: 1, marginBottom: 8, padding: 8 }}
            />
            <Button title="Add" onPress={addMetric} />
            <FlatList
                data={metrics}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4 }}>
                        <Text style={{ flex: 1 }}>{item}</Text>
                        <TouchableOpacity onPress={() => moveMetric(index, 'up')}>
                            <Text style={{ marginHorizontal: 8 }}>⬆️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => moveMetric(index, 'down')}>
                            <Text style={{ marginHorizontal: 8 }}>⬇️</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteMetric(index)}>
                            <Text style={{ marginHorizontal: 8 }}>❌</Text>
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
};

export default MetricsScreen;
