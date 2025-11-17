import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Image, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { Pesan2, api } from './Module';
import { replace } from './NavigationService';

export default class LoginScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            Username: '',
            Pwd: '',
            Icons: "log-in",
            setIzinLokasi: false,
            Lokasi: "",
            rememberMe: false,
            eyeIcon: "eye-off",
            lastSocketData: null
        };
    }

    async componentDidMount() {
        let Token = AsyncStorage.getItem("Token");
        if (Token) replace("Main");
        let sql = await api("sensor");
    }


    handleLogin = async () => {
        const { Username, Pwd } = this.state;
        if (!Username || !Pwd) {
            Pesan2('Username dan password wajib diisi', 'Error', "error");
            return;
        }
        this.setState({ Icons: "loader" });
        let sql = await api("login", { Username, Pwd });
        if (sql.status == "sukses") {
            await AsyncStorage.setItem("Token", "BERHASIL");
            Pesan2("Login Berhasil", "Berhasil");
            this.props.navigation.replace('Main');
        } else {
            Pesan2(sql.pesan, "Gagal", "error");
        }
    };

    render() {
        return (
            <LinearGradient colors={['#F5F0E1', '#0975f5']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.background}>
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    <View style={styles.logoSection}>
                        <View style={styles.logoContainer}>
                            <Image source={require("./assets/Logo.png")} style={{ width: 40, height: 20 }} />
                        </View>
                        <Text style={styles.logoText}>NayaTools</Text>
                    </View>
                    <View style={styles.loginCard}>
                        <Text style={styles.title}>Login</Text>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Username</Text>
                            <View style={styles.inputContainer}>
                                <TextInput style={styles.inputText} value={this.state.Username} onChangeText={(text) => this.setState({ Username: text })} />
                            </View>
                        </View>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.inputContainer}>
                                <TextInput style={styles.inputText} value={this.state.Pwd} onChangeText={(text) => this.setState({ Pwd: text })} secureTextEntry={this.state.eyeIcon === 'eye-off' ? true : false} />
                                <TouchableOpacity onPress={() => {
                                    if (this.state.eyeIcon == "eye-off") {
                                        this.setState({ eyeIcon: "eye" });
                                    } else {
                                        this.setState({ eyeIcon: "eye-off" });
                                    }
                                }}>
                                    <Image source={this.state.eyeIcon == "eye-off" ? require('./assets/eyecoret.png') : require('./assets/eye.png')} style={{ width: 20, height: 20 }} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Login Button */}
                        <TouchableOpacity onPress={this.handleLogin} activeOpacity={0.8} style={styles.loginButtonWrapper}>
                            <View style={styles.loginButton}>
                                <Image source={require("./assets/login.png")} style={{ width: 16, height: 16 }} />
                                <Text style={styles.loginButtonText}>Log In</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.props.navigation.replace('Setting')} activeOpacity={0.8} style={styles.loginButtonWrapper}>
                            <View style={styles.settingButton}>
                                <Image source={require("./assets/setting.png")} style={{ width: 16, height: 16 }} />
                                <Text style={styles.loginButtonText}>Setting</Text>
                            </View>
                        </TouchableOpacity>
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
        paddingVertical: 40,
        paddingHorizontal: 20,
        marginTop: 30
    },
    logoSection: {
        alignItems: 'center',
        marginBottom: 30,
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
        padding: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    title: {
        fontSize: 32,
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
        marginBottom: 20,
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
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: Platform.OS == 'ios' && 10,
        borderWidth: 1,
        borderColor: '#E8E8E8',
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
        marginBottom: 25,
    },
    loginButton: {
        backgroundColor: '#0975f5',
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
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
        paddingVertical: 16,
        justifyContent: 'center',
        gap: 5
    },
});