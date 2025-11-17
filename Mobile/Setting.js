import React, { Component, Fragment } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Image, Platform } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Pesan2, api } from './Module';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import Tabs from './Tabs';

export default class LoginScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Data: {},
            Params: [],
            lastSocketData: null
        };
    }

    async componentDidMount() {
        let sql = await api("data", {});
        if (sql.status == "sukses") this.setState({ Data: sql.data, Params: sql.data.parameter });
    }

    handleSave = async () => {
        const { Data } = this.state;
        let sql = await api("setting", { mode: Data.mode, ssid: Data.ssid, pwd: Data.pwd, wifissid: Data.wifissid, wifipwd: Data.wifipwd });
        if (sql.status == "sukses") {
            Pesan2(sql.pesan, "Berhasil");
            let Token = AsyncStorage.getItem("Token");
            if (Token) {
                this.props.navigation.replace("Main");
            } else {
                this.props.navigation.replace("Login");
            }
        } else {
            Pesan2(sql.pesan, "Gagal", "error");
        }
    };

    handleChange(val, obj) {
        let Data = this.state.Data;
        Data[obj] = val;
        this.setState({ Data });
    }

    render() {
        const { Data, Params } = this.state;
        return (
            <LinearGradient colors={['#0975f5', '#F5F0E1']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.background}>
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    <View style={styles.logoSection}>
                        <View style={styles.logoContainer}>
                            <Image source={require("./assets/Logo.png")} style={{ width: 40, height: 20 }} />
                        </View>
                        <Text style={styles.logoText}>NayaTools</Text>
                    </View>
                    <View style={styles.loginCard}>
                        <Tabs header={[
                            { caption: "Setting Koneksi", for: "TabOnline" },
                            { caption: "Setting System", for: "TabRiwayat" }
                        ]}>
                            <View id="TabOnline" style={{ minHeight: "100%", margin: 10 }}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Konek Ke Wifi</Text>
                                    <View style={styles.inputContainer}>
                                        <TextInput style={styles.inputText} value={Data.ssid} onChangeText={(text) => this.handleChange(text, "ssid")} />
                                    </View>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Password</Text>
                                    <View style={styles.inputContainer}>
                                        <TextInput style={styles.inputText} value={Data.pwd} onChangeText={(text) => this.handleChange(text, "pwd")} />
                                    </View>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Nama SSID</Text>
                                    <View style={styles.inputContainer}>
                                        <TextInput style={styles.inputText} value={Data.wifissid} onChangeText={(text) => this.handleChange(text, "wifissid")} />
                                    </View>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Password</Text>
                                    <View style={styles.inputContainer}>
                                        <TextInput style={styles.inputText} value={Data.wifipwd} onChangeText={(text) => this.handleChange(text, "wifipwd")} />
                                    </View>
                                </View>

                                <TouchableOpacity onPress={this.handleSave} activeOpacity={0.8} style={styles.loginButtonWrapper}>
                                    <View style={styles.loginButton}>
                                        <Icon name="save-outline" size={20} color="#fff" />
                                        <Text style={styles.loginButtonText}>Simpan</Text>
                                    </View>
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.props.navigation.replace('Login')} activeOpacity={0.8} style={styles.loginButtonWrapper}>
                                    <View style={styles.settingButton}>
                                        <Icon name="close-circle-outline" size={20} color="#fff" />
                                        <Text style={styles.loginButtonText}>Batal</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                            <View id="TabRiwayat" style={{ minHeight: "100%", paddingHorizontal: 10 }}>
                                {
                                    Params.map((item, i) => {
                                        return <TouchableOpacity style={styles.card} onPress={(e) => this.props.onPress(e)}>
                                            <Text style={[styles.category, { textAlign: "center" }]}>{item.nama}</Text>
                                            <View style={{ flexDirection: "row", gap: 20 }}>
                                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                                    <View style={styles.imageContainer}>
                                                        <Icon name="thermometer" size={30} color="#e65c00" />
                                                    </View>
                                                    <View style={{ marginLeft: 10 }}>
                                                        <Text style={styles.category}>Suhu</Text>
                                                        <Text style={styles.category}>{item.suhu}</Text>
                                                    </View>
                                                </View>
                                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                                    <View style={styles.imageContainer}>
                                                        <Icon name="water" size={30} color="#00aaff" />
                                                    </View>
                                                    <View style={{ marginLeft: 10 }}>
                                                        <Text style={styles.category}>Kelembapan</Text>
                                                        <Text style={styles.category}>{item.kelembapan}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    })
                                }
                            </View>
                        </Tabs>

                    </View>
                </ScrollView>
            </LinearGradient>
        );
    }
}


const styles = StyleSheet.create({
    background: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        paddingVertical: 10,
        paddingHorizontal: 10,
        marginTop: 20
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 20,
    },
    logoContainer: {
        width: 60,
        height: 60,
        borderRadius: 15,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    logoText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    loginCard: {
        backgroundColor: '#fff',
        borderRadius: 25,
        padding: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
        flex: 1
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1a1a',
        textAlign: 'center',
        marginBottom: 10,
    },
    signupContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
    },
    signupText: {
        fontSize: 14,
        color: '#666',
    },
    signupLink: {
        fontSize: 14,
        color: '#0975f5',
        fontWeight: '600',
    },
    inputGroup: {
        marginBottom: 10,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 8,
        fontWeight: '500',
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#c6daf6ff',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS == 'ios' && 10,
        borderWidth: 1,
        borderColor: '#6c95f7ff',
        // height: 10
    },
    inputText: {
        fontSize: 16,
        color: '#1a1a1a',
        flex: 1,
        // height: Platform.OS == 'android' && 10
    },
    optionsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 25,
    },
    rememberMeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    checkbox: {
        width: 20,
        height: 20,
        borderRadius: 4,
        borderWidth: 2,
        borderColor: '#D1D1D1',
        marginRight: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
    checkboxChecked: {
        backgroundColor: '#F5E8E8',
        borderColor: '#0975f5',
    },
    rememberMeText: {
        fontSize: 14,
        color: '#666',
    },
    forgotPassword: {
        fontSize: 14,
        color: '#0975f5',
        fontWeight: '600',
    },
    loginButtonWrapper: {
        marginBottom: 10,
    },
    loginButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#0975f5',
        borderRadius: 12,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5
    },
    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    settingButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f509099a',
        borderRadius: 12,
        paddingVertical: 10,
        justifyContent: 'center',
        gap: 5
    },

    card: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 10,
        marginVertical: 8,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 3,
        marginHorizontal: 10
    },
    imageContainer: {
        position: "relative",
        alignItems: "center"
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 50,
    },
    badge: {
        position: "absolute",
        bottom: 8,
        left: 8,
        flexDirection: "row",
        backgroundColor: "red",
        paddingVertical: 3,
        paddingHorizontal: 8,
        borderRadius: 16,
        alignItems: "center",
    },
    badgeText: {
        color: "#fff",
        fontSize: 12,
        fontWeight: "bold",
    },
    info: {
        flex: 1,
        marginLeft: 12,
        justifyContent: "center",
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        marginBottom: 2,
    },
    category: {
        fontSize: 16,
        color: "#1a1a1a"
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 2,
    },
});