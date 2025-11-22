import React, { Component } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Camera } from "react-native-vision-camera";
import CameraWrapper from "./CameraWrapper";

class ScanScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
            hasPermission: false,
            device: null,
        };
    }

    async componentDidMount() {
        await this.requestPermission();
    }

    async requestPermission() {
        const cameraPermission = await Camera.requestCameraPermission();
        console.log("Camera Permission:", cameraPermission); // debug

        if (cameraPermission === "authorized") {
            this.setState({ hasPermission: true });
        } else {
            console.log("Camera permission denied");
        }
    }

    onDeviceReady = (device) => {
        this.setState({ device });
    };

    render() {
        const { hasPermission, device } = this.state;

        if (!hasPermission) {
            return (
                <View style={styles.center}>
                    <Text style={styles.permissionText}>Waiting for camera permission...</Text>
                </View>
            );
        }

        if (!device) {
            return (
                <View style={styles.center}>
                    <Text style={styles.permissionText}>Loading camera...</Text>
                </View>
            );
        }

        return (
            <View style={styles.container}>
                {/* Wrapper untuk ambil device backend */}
                <CameraWrapper onDeviceReady={this.onDeviceReady} />

                <Camera
                    style={StyleSheet.absoluteFill}
                    device={device}
                    isActive={true}
                />

                <View style={styles.header}>
                    <Text style={styles.title}>SCAN QR CODE</Text>
                </View>

                <View style={styles.frameBox}></View>

                <View style={styles.bottomContainer}>
                    <TouchableOpacity style={styles.cancelButton} onPress={() => this.props.navigation.goBack()}>
                        <Text style={styles.cancelText}>Cancel</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#000",
    },
    permissionText: {
        color: "#fff",
        fontSize: 18,
    },
    header: {
        position: "absolute",
        top: 40,
        width: "100%",
        alignItems: "center",
    },
    title: {
        color: "#fff",
        fontSize: 22,
        fontWeight: "bold",
    },
    frameBox: {
        width: 260,
        height: 260,
        borderWidth: 3,
        borderColor: "white",
        borderRadius: 16,
        alignSelf: "center",
        marginTop: "40%",
    },
    bottomContainer: {
        position: "absolute",
        bottom: 60,
        width: "100%",
        alignItems: "center",
    },
    cancelButton: {
        paddingHorizontal: 25,
        paddingVertical: 12,
        backgroundColor: "rgba(255,255,255,0.2)",
        borderRadius: 10,
    },
    cancelText: {
        color: "#fff",
        fontSize: 18,
    },
});


export default ScanScreen;
