#include <ESP8266WiFi.h>
#include <WebSocketsServer_Generic.h>
#include <ArduinoJson.h>
#include <LittleFS.h>

#define CONFIG_FILE "/DATA.json"

WebSocketsServer webSocketServer(81);
StaticJsonDocument<1024> config;

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
  String mode = config["mode"].as<String>();
  if (mode == "server") {
    Serial.println("📡 Mode: SERVER (Access Point)");
    WiFi.mode(WIFI_AP);
    WiFi.softAP(
      config["wifissid"].as<const char*>(),
      config["wifipwd"].as<const char*>());
    Serial.print("Access Point IP: ");
    Serial.println(WiFi.softAPIP());
  } else {
    Serial.println("📶 Mode: CLIENT (STA)");
    WiFi.mode(WIFI_STA);
    WiFi.begin(
      config["ssid"].as<const char*>(),
      config["pwd"].as<const char*>());
    Serial.print("Connecting to WiFi");
    while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
    }
    Serial.println();
    Serial.print("Connected! IP: ");
    Serial.println(WiFi.localIP());
  }
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
        } else if (act == "ping") {
          webSocketServer.sendTXT(num, "{\"status\":\"sukses\", \"pong\":true}");
        } else {
          webSocketServer.sendTXT(num, "{\"status\":\"gagal\", \"pesan\":\"unknown_action\"}");
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
}
