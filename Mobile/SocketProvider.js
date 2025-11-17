import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

export const SocketContext = createContext({
    sendMessage: () => { },
    socketData: null,
});

export const SocketProvider = ({ children }) => {
    const [socketData, setSocketData] = useState(null);
    const socketRef = useRef(null);

    useEffect(() => {
        const socket = new WebSocket('ws://192.168.1.9:81');
        socketRef.current = socket;

        socket.onopen = () => console.log('✅ WS connected');
        socket.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                console.log('📩 Received:', data);
                setSocketData(data);
            } catch (err) {
                console.log('❌ Invalid JSON:', event.data);
            }
        };
        socket.onclose = () => console.log('❌ WS closed');
        socket.onerror = (err) => console.error('⚠️ WS Error:', err);

        return () => socket.close();
    }, []);

    const sendMessage = (msg) => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
            const json = typeof msg === 'string' ? msg : JSON.stringify(msg);
            socketRef.current.send(json);
            console.log('📤 Sent:', json);
        } else {
            console.warn('⚠️ WebSocket not ready');
        }
    };

    return (
        <SocketContext.Provider value={{ sendMessage, socketData }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => useContext(SocketContext);
