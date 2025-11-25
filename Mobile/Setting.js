import React, { Component, Fragment, createRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, TextInput, ScrollView, Image, Platform, Modal, Button } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Picker } from '@react-native-picker/picker';
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
            lastSocketData: null,
            showModal: false,
            Detail: {},
            Idx: 0
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

    handleChangeDetail(val, obj) {
        let Params = [...this.state.Params];
        let Idx = this.state.Idx;
        Params[Idx][obj] = val;
        this.setState({ Params });
    }

    async handleSimpanParameter() {
        let Params = [...this.state.Params];
        let Idx = this.state.Idx;
        Params[Idx] = this.state.Detail;
        let sql = await api("saveparamater", { Params });
        if (sql.status == "sukses") {
            Pesan2("Berhasil Update System", "Sukses");
            this.setState({ showModal: false, Params });
        } else {
            Pesan2(sql.pesan, "Gagal", "error");
        }
    }

    async handleDeleteProses() {
        let Idx = this.state.Idx;
        let Params = [...this.state.Params.filter((item, i) => i != Idx)];
        let sql = await api("saveparamater", { Params });
        if (sql.status == "sukses") {
            Pesan2("Berhasil Update System", "Sukses");
            this.setState({ showModal: false, Params });
        } else {
            Pesan2(sql.pesan, "Gagal", "error");
        }
    }

    handleAddParams() {
        let Params = [...this.state.Params];
        Params.push({ nama: "Proses Baru", suhu: 10, kelembapan: 10, relay: 0, act: "on" })
        this.setState({ Params })
    }

    render() {
        const { Data, Params, Detail } = this.state;
        return (
            <LinearGradient colors={['#0975f5', '#F5F0E1']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.background}>
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                        <TouchableOpacity onPress={() => this.props.navigation.goBack()}>
                            <Icon name="arrow-back-outline" size={20} color="#fff" />
                        </TouchableOpacity>
                        <Text style={{ fontWeight: 'bold', fontSize: 16, color: "#fff" }}>Kembali</Text>
                    </View>
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
                            </View>
                            <View id="TabRiwayat" style={{ minHeight: "100%", paddingHorizontal: 10 }}>
                                {
                                    Params.map((item, i) => {
                                        return <TouchableOpacity style={styles.card} onPress={(e) => this.setState({ Detail: item, Idx: i, showModal: true })} key={i}>
                                            <Text style={[styles.category, { textAlign: "center", fontWeight: "bold" }]}>{item.nama}</Text>
                                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                                    <View style={styles.imageContainer}>
                                                        <Icon name="thermometer" size={20} color="#e65c00" />
                                                    </View>
                                                    <View style={{ marginLeft: 10 }}>
                                                        <Text style={styles.category}>Suhu</Text>
                                                        <Text style={styles.category}>{item.suhu}</Text>
                                                    </View>
                                                </View>
                                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                                    <View style={styles.imageContainer}>
                                                        <Icon name="water" size={20} color="#00aaff" />
                                                    </View>
                                                    <View style={{ marginLeft: 10 }}>
                                                        <Text style={styles.category}>Kelembapan</Text>
                                                        <Text style={styles.category}>{item.kelembapan}</Text>
                                                    </View>
                                                </View>
                                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                                    <View style={styles.imageContainer}>
                                                        <Icon name="power-outline" size={20} color={item.act == "on" ? "#e65c00" : "#00aaff"} />
                                                    </View>
                                                    <View style={{ marginLeft: 10 }}>
                                                        <Text style={styles.category}>Relay</Text>
                                                        <Text style={styles.category}>Relay {parseInt(item.relay) + 1}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    })
                                }
                                <TouchableOpacity onPress={() => this.handleAddParams()} activeOpacity={0.8} style={styles.loginButtonWrapper}>
                                    <View style={styles.loginButton}>
                                        <Icon name="save-outline" size={20} color="#fff" />
                                        <Text style={styles.loginButtonText}>Tambah Proses</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </Tabs>
                    </View>
                </ScrollView>

                <Modal animationType="slide" transparent={true} visible={this.state.showModal} onRequestClose={() => this.setState({ showModal: false })}>
                    <View style={styles.centeredView}>
                        <View style={styles.modalView}>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Nama Proses {this.state.Idx}</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput style={styles.inputText} value={Detail.nama} onChangeText={(text) => this.handleChangeDetail(text, "nama")} />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Nilai Suhu</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput style={styles.inputText} keyboardType="numeric" value={String(Detail.suhu)} onChangeText={(text) => this.handleChangeDetail(text, "suhu")} />
                                </View>
                            </View>

                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Nilai Kelembapan</Text>
                                <View style={styles.inputContainer}>
                                    <TextInput style={styles.inputText} keyboardType="numeric" value={String(Detail.kelembapan)} onChangeText={(text) => this.handleChangeDetail(text, "kelembapan")} />
                                </View>
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Relay Yang Dikontrol</Text>
                                <View style={styles.inputContainer}>
                                    <Picker selectedValue={Detail.relay} onValueChange={(itemValue) => this.handleChangeDetail(itemValue, "relay")} style={styles.inputText}>
                                        <Picker.Item style={{ color: "#0975f5" }} label="Silahkan pilih relay" value="" />
                                        {Data.relay && Data.relay.map((item, index) => (
                                            <Picker.Item style={{ color: "#0975f5" }} key={index} label={'Relay ' + item.pin} value={index} />
                                        ))}
                                    </Picker>
                                </View>
                            </View>
                            <View style={styles.inputGroup}>
                                <Text style={styles.label}>Kondisi Relay</Text>
                                <View style={styles.inputContainer}>
                                    <Picker selectedValue={Detail.act} onValueChange={(itemValue, index) => this.handleChangeDetail(itemValue, "act")} style={styles.inputText}>
                                        <Picker.Item style={{ color: "#0975f5" }} label="On" value="on" />
                                        <Picker.Item style={{ color: "#0975f5" }} label="Off" value="off" />
                                    </Picker>
                                </View>
                            </View>
                            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                                <Button title="Batal" onPress={() => this.setState({ showModal: false })} color="#FF6347" />
                                <Button title="Simpan" onPress={() => this.handleSimpanParameter()} color="#0975f5" />
                                <Button title="Hapus Proses" onPress={() => this.handleDeleteProses()} color="#FF6347" />
                            </View>
                        </View>
                    </View>
                </Modal>
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
        marginTop: 10
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
        fontSize: 14,
        color: "#1a1a1a"
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 2,
    },

    centeredView: {
        flex: 1,
        justifyContent: 'center', // Pusatkan secara vertikal
        alignItems: 'center',     // Pusatkan secara horizontal
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Backdrop abu-abu transparan
    },

    modalView: {
        margin: 20,
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: "95%"
    },
});