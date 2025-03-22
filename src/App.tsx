import * as React from 'react';
import { useState, useEffect } from 'react';
import { StatusBar, View, useColorScheme, Dimensions, TouchableOpacity, Text, useWindowDimensions, Platform  } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { TabView, SceneMap } from 'react-native-tab-view';
import { Colors } from 'react-native/Libraries/NewAppScreen';
import Icon from 'react-native-vector-icons/FontAwesome';
import AddScreen from "./screens/AddScreen";
import ViewScreen from "./screens/ViewScreen";
import DefineScreen from "./screens/DefineScreen";
import ShareScreen from "./screens/ShareScreen";
import ImmersiveMode from 'react-native-immersive';


const initialLayout = { width: Dimensions.get('window').width };

const App = (): React.JSX.Element => {
    const isDarkMode = useColorScheme() === 'dark';
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'add', title: 'Add', icon: 'plus' },
        { key: 'view', title: 'View', icon: 'bar-chart' },
        { key: 'define', title: 'Define', icon: 'list' },
        { key: 'share', title: 'Share', icon: 'cloud-download' },
    ]);
    const { width, height } = useWindowDimensions();
    const isLandscape = width > height;

    // Hide status bar and Android nav bar on landscape mode
    useEffect(() => {
        // Hide status bar in landscape, show in portrait
        StatusBar.setHidden(isLandscape, 'slide');

        // Optional: tweak Android nav bar (if you add immersive mode)
        if (Platform.OS === 'android') {
            if (isLandscape) {
                ImmersiveMode.on()
            } else {
                ImmersiveMode.off()
            }
        }

        return () => {
            StatusBar.setHidden(false, 'fade'); // Ensure it resets
        };
    }, [isLandscape]);

    const renderScene = SceneMap({
        add: AddScreen,
        view: ViewScreen,
        define: DefineScreen,
        share: ShareScreen,
    });

    const renderIcon = ({ route, color }: { route: { icon: string }, color: string }) => {
        return <Icon name={route.icon} size={20} color={color} />;
    };

    return (
        <NavigationContainer>
            <TabView
                navigationState={{ index, routes }}
                renderScene={renderScene}
                onIndexChange={setIndex}
                initialLayout={initialLayout}
                tabBarPosition={'bottom'}
                swipeEnabled={true}
                renderTabBar={props => (
                    <View style={{ flexDirection: 'row', backgroundColor: isDarkMode ? Colors.darker : Colors.lighter , borderTopWidth: 1, borderTopColor: 'lightgrey', borderBottomWidth: 1, borderBottomColor: 'lightgrey'}}>
                        {props.navigationState.routes.map((route, i) => (
                            <TouchableOpacity
                                key={i}
                                onPress={() => setIndex(i)}
                                style={{ flex: 1, alignItems: 'center', padding: 8 }}
                            >
                                {renderIcon({ route, color: i === index ? (isDarkMode ? Colors.light : Colors.dark) : (isDarkMode ? Colors.dark : Colors.light) })}
                                <Text style={{ color: i === index ? (isDarkMode ? Colors.light : Colors.dark) : (isDarkMode ? Colors.dark : Colors.light) }}>
                                    {route.title}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            />
        </NavigationContainer>
    );
};

export default App;
