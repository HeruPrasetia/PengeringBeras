import React, { useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { navigationRef } from './NavigationService';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Toast from 'react-native-toast-message';
import Login from './Login';
import Setting from './Setting';
import Main from './Main';

const Stack = createNativeStackNavigator();

const SplashScreen = ({ navigation }) => {
  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        let host = await AsyncStorage.getItem('host');
        if (host === null) {
          navigation.replace('Setting');
          return;
        }

        let Token = await AsyncStorage.getItem('Token');
        if (Token !== null) {
          navigation.replace('Main');
        } else {
          navigation.replace('Login');
        }
      } catch (e) {
        console.log("Error baca storage:", e);
        navigation.replace('Login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <Image source={require('./assets/splash.png')} style={{ flex: 1, width: '100%', height: '100%', resizeMode: 'center', }} />
    </View>
  );
};

export default function App() {
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Main" component={Main} />
        <Stack.Screen name="Setting" component={Setting} />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0975f5',
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
