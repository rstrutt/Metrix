import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, Text, ScrollView } from 'react-native';
import { useColorScheme } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import { readAppFile, writeAppFile, METRIC_VALUES_FILE_PATH,  METRICS_FILE_PATH} from '../utils/fileUtils.ts';
import {generatePastelColor} from "../utils/uiUtils.ts";
import {styles} from "../utils/fontUtils.ts";
import Icon from "react-native-vector-icons/FontAwesome";

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
        <View style={{ flex: 1, padding: 0, backgroundColor: '#f0f0f0'}}>
            <View style={{ flexDirection: 'row', marginBottom: 8, paddingTop:16, paddingBottom:19, paddingLeft:16, paddingRight: 16, backgroundColor: '#f0f0f0', borderBottomWidth: 1, borderBottomColor: 'lightgrey'}}>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', flex: 1 }}>

                    <TouchableOpacity onPress={handleReload} style={{ backgroundColor: isDarkMode ? '#444' : '#87CEEB', padding: 8, borderRadius: 8, marginRight:8, alignItems: 'center' }}>
                        <Text style={[styles.common_bold, {color: '#000'}]}>Reload</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={saveFileContent} style={{ backgroundColor: isDarkMode ? '#444' : '#87CEEB', padding: 8, borderRadius: 8, alignItems: 'center' }}>
                        <Text style={[styles.common_bold, {color: '#000'}]}>Save</Text>
                    </TouchableOpacity>
                </View>
            </View>
            <View style={{ marginTop: 4, marginBottom: 16, marginHorizontal: 16, backgroundColor: '#f0f0f0', padding: 8, borderRadius: 10, shadowColor: '#000', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 10 }}>

                    <TextInput
                        value={fileContent}
                        onChangeText={setFileContent}
                        multiline
                        style={{ borderColor: 'gray', borderWidth: 1, marginVertical: 5, padding: 8, borderRadius: 8, height: 350, textAlignVertical: 'top', color: isDarkMode ? '#fff' : '#000' }}
                    />

                    <TextInput
                        value={definitionsFileContent}
                        onChangeText={setDefinitionsFileContent}
                        multiline
                        style={{ borderColor: 'gray', borderWidth: 1, marginVertical: 5, padding: 8, borderRadius: 8, height: 200, textAlignVertical: 'top', color: isDarkMode ? '#fff' : '#000' }}
                    />


            </View>
        </View>
    );
};

export default ShareScreen;
