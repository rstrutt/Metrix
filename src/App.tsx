import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, useColorScheme } from 'react-native';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import AddScreen from "./screens/AddScreen.tsx";
import ViewScreen from "./screens/ViewScreen.tsx";
import DefineScreen from "./screens/DefineScreen.tsx";
import ShareScreen from "./screens/ShareScreen.tsx";

const Tab = createBottomTabNavigator();

function App(): React.JSX.Element {
    const isDarkMode = useColorScheme() === 'dark';

    return (
        <NavigationContainer>
            <Tab.Navigator
                screenOptions={({ route }) => ({
                    tabBarIcon: ({ color, size }) => {
                        let iconName;

                        if (route.name === 'Add') {
                            console.log("in Add");
                            iconName = 'plus';
                        } else if (route.name === 'View') {
                            console.log("in View");
                            iconName = 'bar-chart';
                        } else if (route.name === 'Define') {
                            console.log("in Define");
                            iconName = 'list';
                        }
                        else if (route.name === 'Share') {
                            console.log("in Share");
                            iconName = 'cloud-download';
                        }
                        else{
                            console.log("in else");
                            iconName = 'Not Defined';
                        }

                        return <Icon name={iconName} size={size} color={color} />;
                    },
                    tabBarActiveTintColor: isDarkMode ? Colors.light : Colors.dark,
                    tabBarInactiveTintColor: isDarkMode ? Colors.dark : Colors.light,
                    tabBarStyle: { backgroundColor: isDarkMode ? Colors.darker : Colors.lighter },
                })}>
                <Tab.Screen name="Add" component={AddScreen} />
                <Tab.Screen name="View" component={ViewScreen} />
                <Tab.Screen name="Define" component={DefineScreen} />
                <Tab.Screen name="Share" component={ShareScreen} />
            </Tab.Navigator>
        </NavigationContainer>
    );
}

export default App;
