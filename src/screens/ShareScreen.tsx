import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { readAppFile, writeAppFile, METRIC_VALUES_FILE_PATH,  METRICS_FILE_PATH} from '../utils/fileUtils.ts';

const ShareScreen = () => {
    const [fileContent, setFileContent] = useState('');
    const [definitionsFileContent, setDefinitionsFileContent] = useState('');
    const isDarkMode = useColorScheme() === 'dark';

    const loadFileContent = async () => {
        const content = await readAppFile(METRIC_VALUES_FILE_PATH);
        setFileContent(content);
    };

    const loadDefinitionsFileContent = async () => {
        const content = await readAppFile(METRICS_FILE_PATH);
        setDefinitionsFileContent(content);
    };

    useEffect(() => {
        loadFileContent();
        loadDefinitionsFileContent();
    }, []);

    const saveFileContent = async () => {
        await writeAppFile(METRIC_VALUES_FILE_PATH, fileContent);
        await writeAppFile(METRICS_FILE_PATH, definitionsFileContent);
    };

    const handleReload = async () => {
        await loadFileContent();
        await loadDefinitionsFileContent();
    };

    return (
        <View style={{ flex: 1, padding: 16, backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }}>

                <TextInput
                    value={fileContent}
                    onChangeText={setFileContent}
                    multiline
                    style={{ borderColor: 'gray', borderWidth: 1, marginVertical: 5, padding: 8, borderRadius: 8, height: 200, textAlignVertical: 'top', color: isDarkMode ? '#fff' : '#000' }}
                />

                <TextInput
                    value={definitionsFileContent}
                    onChangeText={setDefinitionsFileContent}
                    multiline
                    style={{ borderColor: 'gray', borderWidth: 1, marginVertical: 5, padding: 8, borderRadius: 8, height: 200, textAlignVertical: 'top', color: isDarkMode ? '#fff' : '#000' }}
                />

            <TouchableOpacity onPress={handleReload} style={{ backgroundColor: isDarkMode ? '#444' : '#ddd', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 }}>
                <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: 16 }}>Reload</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={saveFileContent} style={{ backgroundColor: isDarkMode ? '#444' : '#ddd', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 }}>
                <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: 16 }}>Save</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ShareScreen;
