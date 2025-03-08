import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, useColorScheme } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';

function EntryScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Entry!</Text>
        </View>
    );
}

function ViewScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>View!</Text>
        </View>
    );
}

function MetricsScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>Metrics!</Text>
        </View>
    );
}

const Tab = createBottomTabNavigator();

function App(): React.JSX.Element {
    const isDarkMode = useColorScheme() === 'dark';

    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={{
                    tabBarActiveTintColor: isDarkMode ? Colors.dark : Colors.light,
                    tabBarInactiveTintColor: isDarkMode ? Colors.dark : Colors.light,
                    tabBarStyle: { backgroundColor: isDarkMode ? Colors.darker : Colors.lighter },
                }}>
                <Tab.Screen name="Entry" component={EntryScreen} />
                <Tab.Screen name="View" component={ViewScreen} />
                <Tab.Screen name="Metrics" component={MetricsScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}

export default App;
