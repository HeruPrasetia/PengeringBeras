import React, { Component, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef, replace } from './NavigationService';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SocketProvider } from './SocketProvider';
import Toast from 'react-native-toast-message';
import Login from './Login';
import Setting from './Setting';

const Stack = createNativeStackNavigator();

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        let Token = await AsyncStorage.getItem('token');
        if (Token) {
          navigation.replace('Main');
        } else {
          navigation.replace('Login');
        }
      } catch (e) {
        console.log("Error baca token:", e);
        navigation.replace('Login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require('./assets/splash.png')} style={{ flex: 1, width: '100%', height: '100%', resizeMode: 'cover', }} />
    </View>
  );
};

export class Main extends Component {
  constructor(props) {
    super(props);
    this.state = {
      log: 'Connecting...',
      Setting: {}
    };
  }

  componentDidMount() {
    this.ws = new WebSocket('ws://192.168.1.4:81/');

    this.ws.onopen = () => {
      this.setState({ log: '✅ Connected to Wemos' });
      this.ws.send(JSON.stringify({ act: "ping" }));
    };

    this.ws.onmessage = (e) => {
      try {
        let data = JSON.parse(e.data);
        console.log(data);
        let act = data.act;
        if (act == "data") {
          this.setState({ Setting: data.data });
        } else if (act == "koneksi") {
          this.setState({ log: data.pesan });
        } else {
          this.setState({ log: data.pesan });
        }
      } catch (err) {
        console.log(e.data);
        this.setState({ log: '❌ ' + e.data });
      }
    };

    this.ws.onerror = (e) => {
      this.setState({ log: '⚠️ Error: ' + e.message });
    };

    this.ws.onclose = () => {
      this.setState({ log: '❌ Disconnected' });
    };
  }

  sendMsg = () => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ act: 'data' }));
    }
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
        <Toast />
      </View>
    );
  }
}

export default function App() {
  return (
    <SocketProvider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="Main" component={Main} />
          <Stack.Screen name="Setting" component={Setting} />
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </SocketProvider>
  );
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
