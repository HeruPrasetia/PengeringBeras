import React, { Component, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef, replace } from './NavigationService';
import { SocketContext } from './SocketProvider';
import { Pesan2 } from './Module';

export default class Main extends Component {
    static contextType = SocketContext;
    constructor(props) {
        super(props);
        this.state = {
            log: 'Connecting...',
            Setting: [],
            Data: [],
            Parameter: []
        };
    }

    componentDidMount() {
        const { socketData, sendMessage } = this.context;
        this.unsubscribe = this.context;
        this.interval = setInterval(async () => {
            console.log(socketData);
            if (socketData) {
                if (socketData.act === 'data') {
                    let Data = socketData.data;
                    this.setState({ Data: Data.data });
                } else if (socketData.act == "setting") {
                    if (socketData.status == "sukses") {
                        Pesan2(socketData.pesan, "Sukses");
                        this.props.navigation.replace("Login");
                    } else {
                        Pesan2(socketData.pesan, "Gagal", "error");
                    }
                }
            }
        }, 500);
        sendMessage({ act: 'data' });
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    sendMsg = () => {
        const { sendMessage } = this.context;
        sendMessage({ act: 'data', test: true });
    };

    handleLogout = async () => {
        await AsyncStorage.clear();
        replace('Login');
    };

    render() {
        const { Setting, log } = this.state;
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text>{log}</Text>
                <Button title="Kirim Pesan" onPress={this.sendMsg} />
                <Button title="Keluar" onPress={this.handleLogout} />
                <Text>
                    SSID:{Setting.ssid}
                </Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#67091D',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#fff',
        fontSize: 24,
        marginBottom: 20,
    },
    icon: {
        width: 24,
        height: 24,
        resizeMode: 'contain',
    },
});
