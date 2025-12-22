import React, { Component } from 'react';
import { View, Text, Button, PermissionsAndroid, Platform, Alert, TextInput } from 'react-native';
import WifiManager from "react-native-wifi-reborn";
import AsyncStorage from '@react-native-async-storage/async-storage';

class WifiConnectScreen extends Component {

    constructor(props) {
        super(props);
        this.state = {
            ssid: "mesin_pengering",
            password: "12345678",
            isConnecting: false,
            wifiList: [],
            hostIP: ''
        };
    }

    async componentDidMount() {
        let hostIP = await AsyncStorage.getItem("host") || "http://192.168.1.6/";
        this.setState({ hostIP });
    }

    handleSaveIP = async () => {
        if (!this.state.hostIP) {
            Alert.alert("Gagal", "IP Device harus diisi");
            return;
        }
        await AsyncStorage.setItem("host", this.state.hostIP);
        Alert.alert("Berhasil", "IP Device berhasil disimpan");
        if (this.props.onRefresh) this.props.onRefresh();
    };

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
                <Text style={{ fontSize: 20, marginBottom: 10, fontWeight: 'bold' }}>Device Tidak terhubung</Text>

                <View style={{ marginBottom: 20 }}>
                    <Text style={{ color: '#666', marginBottom: 5 }}>Otomatis cari device via Wifi:</Text>
                    <Text>SSID: {this.state.ssid}</Text>
                    <Text>Password: {this.state.password}</Text>
                    <View style={{ marginTop: 10 }}>
                        <Button title={this.state.isConnecting ? "Menghubungkan..." : "Cari Device"} onPress={this.connectToWifi} />
                    </View>
                </View>

                <View style={{ borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 20 }}>
                    <Text style={{ color: '#666', marginBottom: 10 }}>Atau set IP Device secara manual:</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, paddingHorizontal: 16, borderWidth: 1, borderColor: '#E8E8E8', marginBottom: 10 }}>
                        <TextInput style={{ flex: 1, height: 45 }} placeholder="Contoh: 192.168.1.6" value={this.state.hostIP} onChangeText={(text) => this.setState({ hostIP: text })} />
                    </View>
                    <Button title="Simpan IP dan Hubungkan" onPress={this.handleSaveIP} color="#0975f5" />
                </View>
            </View>
        );
    }
}

export default WifiConnectScreen;
