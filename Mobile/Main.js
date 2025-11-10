import React, { Component } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ScrollView } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { SocketContext } from './SocketProvider';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message';

export default class Home extends Component {
    static contextType = SocketContext;

    constructor(props) {
        super(props);
        this.state = {
            suhu: 0,
            kelembapan: 0,
            relays: [false, false, false, false],
            riwayat: [],
            mode: "off"
        };
    }

    componentDidMount() {
        this.context.sendMessage({ act: 'data' });

        this.interval = setInterval(() => {
            const { socketData } = this.context;
            if (socketData) {
                switch (socketData.act) {
                    case 'sensor':
                        this.setState({
                            suhu: socketData.suhu,
                            kelembapan: socketData.kelembapan,
                            mode:socketData.mode
                        });
                        break;
                    case 'relay_status':
                        this.setState({ relays: socketData.relays });
                        break;
                    case 'riwayat_update':
                        this.setState({ riwayat: socketData.data });
                        break;
                    case 'data':
                        this.setState({ mode: socketData.data.mode });
                        break;
                    default:
                        break;
                }
            }
        }, 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    toggleRelay = index => {
        const relays = [...this.state.relays];
        relays[index] = !relays[index];

        this.context.sendMessage({
            act: 'relay_control',
            relay: index + 1,
            status: relays[index] ? 1 : 0,
        });

        this.setState({ relays });
        Toast.show({
            type: 'info',
            text1: `Relay ${index + 1} ${relays[index] ? 'ON' : 'OFF'}`,
        });
    };

    renderRelayCard = (item, index) => (
        <TouchableOpacity
            key={index}
            style={[styles.relayCard, { backgroundColor: item ? '#e65c00' : '#555' }]}
            onPress={() => this.toggleRelay(index)}>
            <Icon
                name={item ? 'flame' : 'flame-outline'}
                size={30}
                color="#fff"
            />
            <Text style={styles.relayText}>Relay {index + 1}</Text>
            <Text style={styles.relayStatus}>{item ? 'ON' : 'OFF'}</Text>
        </TouchableOpacity>
    );

    handleProses() {
        const { sendMessage } = this.context;
        let { mode } = this.state;
        if (mode == "off") {
            sendMessage({ act: "proses", mode: "Proses Berlangsung" });
        } else {
            sendMessage({ act: "proses", mode: "off" });
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
                                    {r.waktu} — {r.keterangan}
                                </Text>
                            </View>
                        ))
                    )}
                </ScrollView>

                <Toast />
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
