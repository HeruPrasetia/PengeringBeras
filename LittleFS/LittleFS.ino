#include <ESP8266WiFi.h>
#include <WebSocketsServer_Generic.h>
#include <ArduinoJson.h>
#include <LittleFS.h>
#include <DHT11.h>
#define MQ05 A0
#define relay1 D0
#define relay2 D5
#define relay3 D6
#define relay4 D7
#define CONFIG_FILE "/db.json"

WebSocketsServer webSocketServer(81);
StaticJsonDocument<1024> config;
DHT11 dht11(4);

unsigned long lastSend = 0;
const unsigned long sendInterval = 5000;
unsigned long lastDhtRead = 0;
int suhu = 0;

// ==============================
// 📦 FUNGSI: BACA CONFIG
// ==============================
bool loadConfig() {
  if (!LittleFS.exists(CONFIG_FILE)) {
    Serial.println("Config file not found, creating default...");

    config["ssid"] = "GRATIS";
    config["pwd"] = "Bissmillah123";
    config["wifissid"] = "mesin_pengering";
    config["wifipwd"] = "1234";
    config["username"] = "naylatools";
    config["userpwd"] = "0000";
    config["parameter"] = JsonArray();
    config["data"] = JsonArray();
    config["setting"] = JsonObject();
    config["mode"] = "client";

    File f = LittleFS.open(CONFIG_FILE, "w");
    if (f) {
      serializeJson(config, f);
      f.close();
    }
    return true;
  }

  File file = LittleFS.open(CONFIG_FILE, "r");
  if (!file) {
    Serial.println("Failed to open config file");
    return false;
  }

  DeserializationError err = deserializeJson(config, file);
  file.close();

  if (err) {
    Serial.println("Failed to parse config file, creating new default...");
    LittleFS.remove(CONFIG_FILE);
    return loadConfig();
  }

  Serial.println("Config loaded:");
  serializeJsonPretty(config, Serial);
  Serial.println();
  return true;
}

// ==============================
// 🌐 SETUP WIFI SESUAI MODE
// ==============================
void setupWiFi() {
  WiFi.mode(WIFI_AP_STA);  // 🧩 aktifkan dua mode sekaligus

  // 1️⃣ Koneksi ke WiFi router
  WiFi.begin(config["ssid"].as<const char*>(), config["pwd"].as<const char*>());
  Serial.print("Connecting to WiFi");
  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 10000) {  // timeout 10 detik
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Connected to WiFi! IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("Failed to connect as STA.");
  }

  // 2️⃣ Bikin Access Point juga
  WiFi.softAP(
    config["wifissid"].as<const char*>(),
    config["wifipwd"].as<const char*>());
  Serial.print("Access Point started! IP: ");
  Serial.println(WiFi.softAPIP());
}

// ==============================
// 💾 FUNGSI: SIMPAN CONFIG
// ==============================
bool saveConfig() {
  File file = LittleFS.open(CONFIG_FILE, "w");
  if (!file) {
    Serial.println("Failed to open config file for writing");
    return false;
  }
  serializeJson(config, file);
  file.close();
  Serial.println("Config saved!");
  return true;
}

// ==============================
// ⚡ WEBSOCKET SERVER HANDLER
// ==============================
void onWebSocketEvent(uint8_t num, WStype_t type, uint8_t* payload, size_t length) {
  switch (type) {
    case WStype_CONNECTED:
      {
        IPAddress ip = webSocketServer.remoteIP(num);
        Serial.printf("Client [%u] connected from %s\n", num, ip.toString().c_str());
        webSocketServer.sendTXT(num, "{\"status\":\"sukses\", \"act\":\"koneksi\", \"pesan\":\"✅ Connected to ESP WebSocket Server!\"}");
        break;
      }

    case WStype_TEXT:
      {
        // ubah payload ke String dan parse JSON
        String msg = String((char*)payload);
        msg.trim();

        Serial.printf("Client [%u] sent: %s\n", num, msg.c_str());

        StaticJsonDocument<512> doc;
        DeserializationError err = deserializeJson(doc, msg);

        if (err) {
          webSocketServer.sendTXT(num, "{\"error\":\"invalid_json\"}");
          Serial.println("⚠️ JSON parse error");
          return;
        }

        String act = doc["act"] | "";

        // === aksi utama ===
        if (act == "data") {
          String jsonStr;
          serializeJson(config, jsonStr);
          webSocketServer.sendTXT(num, "{\"status\":\"sukses\", \"act\":\"data\", \"data\": " + jsonStr + "}");
        } else if (act == "update") {
          const char* key = doc["key"];
          const char* value = doc["value"];

          if (key && value) {
            config[key] = value;
            saveConfig();
            webSocketServer.sendTXT(num, "{\"status\":\"sukses\", \"pesan\":\"Config updated\"}");
            Serial.printf("Config key '%s' updated to '%s'\n", key, value);
          } else {
            webSocketServer.sendTXT(num, "{\"status\":\"gagal\", \"pesan\":\"missing_key_or_value\"}");
          }
        } else if (act == "save") {
          JsonObject data = doc["data"].as<JsonObject>();
          if (!data.isNull()) {
            for (JsonPair kv : data) {
              config[kv.key().c_str()] = kv.value();
            }
            saveConfig();
            webSocketServer.sendTXT(num, "{\"status\":\"sukses\",\"pesan\":\"All config replaced\"}");
          } else {
            webSocketServer.sendTXT(num, "{\"status\":\"gagal\", \"pesan\":\"missing_data_object\"}");
          }
        } else if (act == "setting") {
          String ssid = doc["ssid"] | "";
          String pwd = doc["pwd"] | "";
          String wifissid = doc["wifissid"] | "";
          String wifipwd = doc["wifipwd"] | "";
          config["ssid"] = ssid;
          config["pwd"] = pwd;
          config["wifissid"] = wifissid;
          config["wifipwd"] = wifipwd;

          saveConfig();
          webSocketServer.sendTXT(num, "{\"status\":\"sukses\",\"pesan\":\"All config replaced\"}");
        } else if (act == "relayon") {
          String relay = doc["relay"] | "";
          const char* cStyleString = relay.c_str();
          Serial.printf(cStyleString);
          if (relay == "1") {
            digitalWrite(relay1, HIGH);
          } else if (relay == "2") {
            digitalWrite(relay2, HIGH);
          } else if (relay == "3") {
            digitalWrite(relay3, HIGH);
          } else if (relay == "4") {
            digitalWrite(relay4, HIGH);
          }

          webSocketServer.sendTXT(num, "{\"status\":\"sukses\",\"pesan\":\"Berhasil\"}");
        } else if (act == "relayoff") {
          String relay = doc["relay"] | "";
          const char* cStyleString = relay.c_str();
          Serial.printf(cStyleString);
          if (relay == "1") {
            digitalWrite(relay1, LOW);
          } else if (relay == "2") {
            digitalWrite(relay2, LOW);
          } else if (relay == "3") {
            digitalWrite(relay3, LOW);
          } else if (relay == "4") {
            digitalWrite(relay4, LOW);
          }

          webSocketServer.sendTXT(num, "{\"status\":\"sukses\",\"pesan\":\"Berhasil\"}");
        } else if (act == "proses") {
          String mode = doc["mode"] | "off";
          config["mode"] = mode;

          saveConfig();
          webSocketServer.sendTXT(num, "{\"status\":\"sukses\",\"pesan\":\"Berhasil\"}");
        } else if (act == "login") {
          String Username = doc["Username"] | "";
          String Pwd = doc["Pwd"] | "";
          if (Username == config["username"].as<const char*>()) {
            if (Pwd == config["userpwd"].as<const char*>()) {
              webSocketServer.sendTXT(num, "{\"status\":\"sukses\", \"act\":\"login\", \"pesan\":\"initoken\"}");
            } else {
              webSocketServer.sendTXT(num, "{\"status\":\"gagal\", \"act\":\"login\", \"pesan\":\"Password salah\"}");
            }
          } else {
            webSocketServer.sendTXT(num, "{\"status\":\"gagal\", \"act\":\"login\", \"pesan\":\"Username salah\"}");
          }
        } else if (act == "ping") {
          webSocketServer.sendTXT(num, "{\"status\":\"sukses\",  \"pong\":true}");
        } else {
          webSocketServer.sendTXT(num, "{\"status\":\"gagal\",  \"pesan\":\"unknown_action\"}");
        }

        break;
      }

    case WStype_DISCONNECTED:
      Serial.printf("Client [%u] disconnected\n", num);
      break;

    default:
      break;
  }
}

// ==============================
// 🚀 SETUP
// ==============================
void setup() {
  Serial.begin(115200);
  Serial.println();
  pinMode(relay1, OUTPUT);
  pinMode(relay2, OUTPUT);
  pinMode(relay3, OUTPUT);
  pinMode(relay4, OUTPUT);
  pinMode(MQ05, INPUT);
  if (!LittleFS.begin()) {
    Serial.println("❌ LittleFS mount failed!");
    return;
  }

  if (!loadConfig()) {
    Serial.println("❌ Gagal load config!");
  }

  // 🧾 Tampilkan data config
  Serial.println("=== CONFIG DATA ===");
  serializeJsonPretty(config, Serial);
  Serial.println("\n===================");

  // 🌐 Setup WiFi (AP / STA)
  setupWiFi();

  // ⚡ Start WebSocket Server
  webSocketServer.begin();
  webSocketServer.onEvent(onWebSocketEvent);
  Serial.println("✅ WebSocket Server started at port 81");
}

void loop() {
  webSocketServer.loop();
  unsigned long now = millis();

  if (now - lastDhtRead > 5000) {
    lastDhtRead = now;
    suhu = dht11.readTemperature();
  }

  int nilai = analogRead(MQ05);
  int persen = map(nilai, 1023, 0, 0, 100);

  if (now - lastSend > sendInterval) {
    lastSend = now;
    webSocketServer.broadcastTXT(
      "{\"status\":\"sukses\", \"act\":\"sensor\", \"suhu\":" + String(suhu) + ", \"kelembapan\":" + String(persen) + ", \"mode\":\"" + String(config["mode"].as<const char*>()) + "\"}");
  }
}
