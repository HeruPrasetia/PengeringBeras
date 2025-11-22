import React from "react";
import { useCameraDevices } from "react-native-vision-camera";

export default function CameraWrapper({ onDeviceReady }) {
    const devices = useCameraDevices();
    const device = devices.back;

    React.useEffect(() => {
        if (device) {
            onDeviceReady(device);
        }
    }, [device]);

    return null; // tidak render apapun
}
