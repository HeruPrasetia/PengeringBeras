import React, { Component } from 'react';
import { View, Text, Button } from 'react-native';

export default class WSExample extends Component {
  constructor(props) {
    super(props);
    this.state = {
      log: 'Connecting...',
      Setting: {}
    };
  }

  componentDidMount() {
    this.ws = new WebSocket('ws://192.168.1.4:81/');

    this.ws.onopen = () => {
      this.setState({ log: '✅ Connected to Wemos' });
      this.ws.send(JSON.stringify({ act: "ping" }));
    };

    this.ws.onmessage = (e) => {
      try {
        let data = JSON.parse(e.data);
        console.log(data);
        let act = data.act;
        if (act == "data") {
          this.setState({ Setting: data.data });
        } else if (act == "koneksi") {
          this.setState({ log: data.pesan });
        } else {
          this.setState({ log: data.pesan });
        }
      } catch (err) {
        console.log(e.data);
        this.setState({ log: '❌ ' + e.data });
      }
    };

    this.ws.onerror = (e) => {
      this.setState({ log: '⚠️ Error: ' + e.message });
    };

    this.ws.onclose = () => {
      this.setState({ log: '❌ Disconnected' });
    };
  }

  sendMsg = () => {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ act: 'data' }));
    }
  };

  render() {
    const { Setting, log } = this.state;
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>{log}</Text>
        <Button title="Kirim Pesan" onPress={this.sendMsg} />
        <Text>
          SSID:{Setting.ssid}
        </Text>
      </View>
    );
  }
}
