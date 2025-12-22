import React, { Component, memo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';

const Tab = createMaterialTopTabNavigator();

function MyTabBar({ state, descriptors, navigation }) {
    return (
        <View style={styles.tabBar}>
            {state.routes.map((route, index) => {
                const { options } = descriptors[route.key];
                const label = options.tabBarLabel ?? options.title ?? route.name;
                const isFocused = state.index === index;

                const onPress = () => {
                    const event = navigation.emit({
                        type: 'tabPress',
                        target: route.key,
                        canPreventDefault: true,
                    });

                    if (!isFocused && !event.defaultPrevented) {
                        navigation.navigate(route.name);
                    }
                };

                return (
                    <TouchableOpacity
                        key={index}
                        onPress={onPress}
                        style={[
                            styles.tabItem,
                            isFocused ? styles.activeTab : styles.inactiveTab,
                        ]}
                    >
                        <Text style={[styles.tabText, isFocused && styles.activeText]}>
                            {label}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

export default class Tabs extends Component {
    render() {
        const { header, children } = this.props;
        const childrenMap = React.Children.toArray(children).reduce((acc, child) => {
            acc[child.props.id] = child;
            return acc;
        }, {});

        return (
            <Tab.Navigator tabBar={props => <MyTabBar {...props} />}>
                {header.map((item, index) => {
                    const targetChild = childrenMap[item.for];
                    if (!targetChild) return null;

                    return (
                        <Tab.Screen
                            key={item.for}
                            name={item.caption}
                            children={() => targetChild} // ini penting
                            options={{ title: item.caption }}
                        />
                    );
                })}
            </Tab.Navigator>
        );
    }
}

const styles = StyleSheet.create({
    tabBar: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        margin: 10,
        borderRadius: 25,
        padding: 5,
        shadowColor: '#0975f5',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        elevation: 5,
    },
    tabItem: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: 20
    },
    activeTab: {
        backgroundColor: '#b8d5f4ff',
    },
    inactiveTab: {
        backgroundColor: 'transparent',
    },
    tabText: {
        fontWeight: 'bold',
        color: '#666',
    },
    activeText: {
        color: '#0975f5',
    },
});
