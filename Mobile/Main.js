import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/Ionicons';
import { Pesan2, api } from './Module';

export default class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            suhu: 0,
            kelembapan: 0,
            relays: [],
            riwayat: [],
            mode: "off",
            lastSocketData: null
        };
    }

    async componentDidMount() {
        const now = Math.floor(Date.now() / 1000);
        const offset = new Date().getTimezoneOffset() * 60 * -1; // detik
        let sql = await api("setTime", { time: now, offset });
        console.log(sql);
        this.handleMain();
    }

    async handleMain() {
        let sql = await api("sensor", {});
        if (sql.status == "sukses") this.setState({ kelembapan: sql.kelembapan, suhu: sql.suhu, mode: sql.mode, relays: sql.relay, riwayat: sql.data }, () => {
            setInterval(async () => {
                let sql = await api("sensor", {});
                console.log(sql);
                if (sql.status == "sukses") this.setState({ kelembapan: sql.kelembapan, suhu: sql.suhu, mode: sql.mode, relays: sql.relay, riwayat: sql.data })
            }, 10000);
        });
    }

    toggleRelay = async (item) => {
        let sql = item.status == 1 ? await api("relayoff", { id: item.pin }) : await api("relayon", { id: item.pin });
        if (sql.status == "sukses") {
            this.setState({ relays: sql.relay });
            Pesan2(`Relay ${item.pin} ${item.status == 1 ? 'ON' : 'OFF'}`, "Sukses");
        }
    };

    renderRelayCard = (item, index) => (
        <TouchableOpacity
            key={index}
            style={[styles.relayCard, { backgroundColor: item.status == 1 ? '#e65c00' : '#555' }]}
            onPress={() => this.toggleRelay(item)}>
            <Icon
                name={item.status == 1 ? 'flame' : 'flame-outline'}
                size={30}
                color="#fff"
            />
            <Text style={styles.relayText}>Relay {item.pin}</Text>
            <Text style={styles.relayStatus}>{item.status == 1 ? 'ON' : 'OFF'}</Text>
        </TouchableOpacity>
    );

    async handleProses() {
        let { mode } = this.state;
        let sql = await api("proses", { mode: mode == "off" ? "Proses Berlangsung" : "off" });
        if (sql.status == "sukses") {
            let Mode = mode == "off" ? "Proses Berlangsung" : "off";
            this.setState({ mode: Mode });
            Pesan2(sql.pesan, "Sukses");
        } else {
            Pesan2(sql.pesan, "Gagal");
        }
    }

    render() {
        const { suhu, kelembapan, relays, riwayat, mode } = this.state;
        const { navigation } = this.props;

        return (
            <LinearGradient colors={['#dad5c5ff', '#0975f5']} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.title}>Dashboard Pengering Gabah</Text>

                    <TouchableOpacity
                        style={styles.settingButton}
                        onPress={() => navigation.navigate('Setting')}>
                        <Icon name="settings" size={28} color="#fff" />
                    </TouchableOpacity>
                </View>

                <View style={styles.sensorContainer}>
                    <View style={styles.card}>
                        <Icon name="thermometer" size={40} color="#e65c00" />
                        <Text style={styles.label}>Suhu</Text>
                        <Text style={styles.value}>{suhu.toFixed(1)}°C</Text>
                    </View>

                    <View style={styles.card}>
                        <Icon name="water" size={40} color="#00aaff" />
                        <Text style={styles.label}>Kelembapan</Text>
                        <Text style={styles.value}>{kelembapan.toFixed(1)}%</Text>
                    </View>
                </View>

                <TouchableOpacity activeOpacity={0.85} onPress={() => this.handleProses()}>
                    <LinearGradient
                        colors={mode == "off" ? ['#589ef3ff', '#0975f5'] : ['#f39045ff', '#f56f09ff']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.button}>
                        <Icon name={mode == "off" ? "flame-outline" : "flame"} size={26} color="#fff" style={{ marginRight: 10 }} />
                        <Text style={styles.text}>{mode == "off" ? "Mulai Pengeringan" : mode}</Text>
                    </LinearGradient>
                </TouchableOpacity>

                <Text style={styles.subTitle}>Kontrol Relay</Text>
                <View style={styles.relayContainer}>
                    {relays.map(this.renderRelayCard)}
                </View>

                <Text style={styles.subTitle}>Riwayat Pengeringan</Text>
                <ScrollView style={styles.historyBox}>
                    {riwayat.length === 0 ? (
                        <Text style={styles.emptyText}>Belum ada riwayat</Text>
                    ) : (
                        riwayat.map((r, i) => (
                            <View key={i} style={styles.historyItem}>
                                <Icon name="time-outline" size={20} color="#fff" />
                                <Text style={styles.historyText}>
                                    {r.time} — {r.mode}
                                </Text>
                            </View>
                        ))
                    )}
                    <View style={{ marginBottom: 100 }} />
                </ScrollView>
            </LinearGradient>
        );
    }
}

const styles = StyleSheet.create({
    container: { flex: 1, padding: 20 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
    settingButton: { padding: 8 },
    sensorContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginVertical: 20,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.15)',
        borderRadius: 20,
        padding: 20,
        width: 140,
        alignItems: 'center',
    },
    label: { color: '#ddd', fontSize: 16 },
    value: { color: '#fff', fontSize: 26, fontWeight: 'bold', marginTop: 5 },
    subTitle: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 10,
        marginBottom: 5
    },
    relayContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    relayCard: {
        width: '48%',
        borderRadius: 15,
        padding: 15,
        marginBottom: 10,
        alignItems: 'center',
    },
    relayText: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 5 },
    relayStatus: { color: '#eee', fontSize: 14 },
    historyBox: {
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 12,
        padding: 10,
        height: 160,
    },
    emptyText: { color: '#aaa', textAlign: 'center', marginTop: 20 },
    historyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 4,
    },
    historyText: { color: '#fff', marginLeft: 8 },
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 32,
        borderRadius: 16,
        shadowColor: '#000',
        shadowOpacity: 0.25,
        shadowOffset: { width: 0, height: 4 },
        shadowRadius: 6,
        elevation: 5,
    },
    text: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        letterSpacing: 0.5,
    },
});
