import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { readAppFile, writeAppFile, METRIC_VALUES_FILE_PATH} from '../utils/fileUtils.ts';

const ShareScreen = () => {
    const [fileContent, setFileContent] = useState('');
    const isDarkMode = useColorScheme() === 'dark';

    useEffect(() => {
        const loadFileContent = async () => {
            const content = await readAppFile(METRIC_VALUES_FILE_PATH);
            setFileContent(content);
        };
        loadFileContent();
    }, []);

    const saveFileContent = async () => {
        await writeAppFile(METRIC_VALUES_FILE_PATH, fileContent);
    };

    return (
        <View style={{ flex: 1, padding: 16, backgroundColor: isDarkMode ? Colors.darker : Colors.lighter }}>
            <ScrollView>
                <TextInput
                    value={fileContent}
                    onChangeText={setFileContent}
                    multiline
                    style={{ borderColor: 'gray', borderWidth: 1, padding: 8, borderRadius: 8, height: 400, textAlignVertical: 'top', color: isDarkMode ? '#fff' : '#000' }}
                />
            </ScrollView>
            <TouchableOpacity onPress={saveFileContent} style={{ backgroundColor: isDarkMode ? '#444' : '#ddd', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 16 }}>
                <Text style={{ color: isDarkMode ? '#fff' : '#000', fontSize: 16 }}>Save</Text>
            </TouchableOpacity>
        </View>
    );
};

export default ShareScreen;
