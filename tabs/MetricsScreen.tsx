import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { readMetricsFromFile, saveMetricsToFile } from '../fileUtils.ts';
import Icon from 'react-native-vector-icons/FontAwesome';

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
        <View style={{ flex: 1, padding: 16, backgroundColor: isDarkMode ? Colors.darker : Colors.lighter}}>
            <TextInput
                value={newMetric}
                onChangeText={setNewMetric}
                placeholder="Add new metric"
                style={{ borderColor: 'gray', borderWidth: 1, marginBottom: 8, padding: 8, borderRadius: 8 }}
            />
            {/*<View style={{ marginBottom: 4 }}>*/}
            {/*    <Button title="Add" onPress={addMetric} />*/}
            {/*</View>*/}
            <TouchableOpacity onPress={addMetric} style={{ backgroundColor: isDarkMode ? '#444' : '#ddd', padding: 12, borderRadius: 8, alignItems: 'center', marginBottom: 6 }}>
                <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: 16 }}>Add</Text>
            </TouchableOpacity>
            <FlatList
                data={metrics}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 4, backgroundColor: '#e3e2e2', padding: 4, borderRadius: 10, height: 50}}>
                        <Text style={{ flex: 1, fontSize: 16 }}>{item}</Text>
                        <TouchableOpacity onPress={() => moveMetric(index, 'up')} style={{ marginHorizontal: 8 }}>
                            <Icon name="arrow-up" size={20} color={isDarkMode ? '#888' : '#555'} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => moveMetric(index, 'down')} style={{ marginHorizontal: 8 }}>
                            <Icon name="arrow-down" size={20} color={isDarkMode ? '#888' : '#555'} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => deleteMetric(index)} style={{ marginHorizontal: 8 }}>
                            <Icon name="trash" size={20} color={isDarkMode ? '#888' : '#555'} />
                        </TouchableOpacity>
                    </View>
                )}
            />
        </View>
    );
};

export default MetricsScreen;
