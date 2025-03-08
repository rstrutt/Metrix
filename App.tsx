import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, useColorScheme } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import Icon from 'react-native-vector-icons/Ionicons';
import MetricsScreen from "./MetricsScreen.tsx";
import EntryScreen from "./EntryScreen.tsx";

// function EntryScreen() {
//     return (
//         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//             <Text>Entry!</Text>
//         </View>
//     );
// }

function ViewScreen() {
    return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Text>View!</Text>
        </View>
    );
}

// function MetricsScreen() {
//     return (
//         <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//             <Text>Metrics!</Text>
//         </View>
//     );
// }

const Tab = createBottomTabNavigator();

function App(): React.JSX.Element {
    const isDarkMode = useColorScheme() === 'dark';

    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ color, size }) => {
                        let iconName;

                        if (route.name === 'Entry') {
                            console.log("in Entry");
                            iconName = 'add-to-list';
                        } else if (route.name === 'View') {
                            console.log("in View");
                            iconName = 'ios-eye';
                        } else if (route.name === 'Metrics') {
                            console.log("in Metrics");
                            iconName = 'ios-stats-chart';
                        }
                        else{
                            console.log("in else");
                            iconName = 'xx';
                        }

                        return <Icon name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: isDarkMode ? Colors.light : Colors.dark,
                    tabBarInactiveTintColor: isDarkMode ? Colors.dark : Colors.light,
                    tabBarStyle: { backgroundColor: isDarkMode ? Colors.darker : Colors.lighter },
                })}>
                <Tab.Screen name="Entry" component={EntryScreen} />
                <Tab.Screen name="View" component={ViewScreen} />
                <Tab.Screen name="Metrics" component={MetricsScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}

export default App;
