import React, { Component } from 'react';
import {
    View,
    Text,
    Button,
    PermissionsAndroid,
    Platform,
    Alert,
} from 'react-native';
import WifiManager from "react-native-wifi-reborn";

class WifiConnectScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ssid: "mesin_pengering",
            password: "12345678",
            isConnecting: false,
            wifiList: []
        };
    }

    async requestPermission() {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }
        return true;
    }

    connectToWifi = async () => {
        const ok = await this.requestPermission();
        if (!ok) {
            Alert.alert("Permission required", "Location permission diperlukan untuk connect WiFi");
            return;
        }

        this.setState({ isConnecting: true });

        WifiManager.connectToProtectedSSID(this.state.ssid, this.state.password, false, false)
            .then(() => {
                Alert.alert("Success", "Berhasil konek ke WiFi " + this.state.ssid);
                this.setState({ isConnecting: false });
            })
            .catch((error) => {
                Alert.alert("Failed", "Gagal connect: " + error.message);
                this.setState({ isConnecting: false });
            });
    }


    scanWifi = async () => {
        const perm = await this.requestPermission();
        if (!perm) {
            alert("Izin lokasi ditolak!");
            return;
        }

        try {
            const result = await WifiManager.loadWifiList();
            this.setState({ wifiList: JSON.parse(result) });
        } catch (e) {
            console.log("Scan error:", e);
        }
    };

    render() {
        return (
            <View style={{ padding: 20 }}>
                <Text style={{ fontSize: 20, marginBottom: 10 }}>Device Tidak terhubung</Text>
                <Text>SSID: {this.state.ssid}</Text>
                <Text>Password: {this.state.password}</Text>

                <Button title={this.state.isConnecting ? "Menghubungkan..." : "Cari Device"} onPress={this.connectToWifi} />
            </View>
        );
    }
}

export default WifiConnectScreen;
