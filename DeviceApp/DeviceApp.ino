#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <ESP8266WiFi.h>
#include <ESP8266httpUpdate.h>
#include <WiFiClient.h>
#include <ArduinoJson.h>
#include <LittleFS.h>
#include <DHT11.h>
#include <ArduinoOTA.h>

#define MQ05 A0
#define relay1 D0
#define relay2 D5
#define relay3 D6
#define relay4 D7
#define CONFIG_FILE "/db.json"
#define CURRENT_VERSION "1.0.0"
#define VERSION_URL "http://iot.naylatools.com/versions.txt"
#define UPDATE_URL "http://iot.naylatools.com/update.bin"

ESP8266WebServer server(80);
StaticJsonDocument<1024> config;
DHT11 dht11(4);

unsigned long lastDhtRead = 0;
int suhu = 0;
unsigned long lastCheck = 0;
unsigned long lastRuleRun = 0;
const unsigned long ruleInterval = 1000;
unsigned long GlobalTimestamp = 0;
unsigned long lastMillis = 0;

bool loadConfig() {
  if (!LittleFS.exists(CONFIG_FILE)) {
    config["ssid"] = "GRATIS";
    config["pwd"] = "Bissmillah123";
    config["wifissid"] = "mesin_pengering";
    config["wifipwd"] = "12345678";
    config["username"] = "naylatools";
    config["userpwd"] = "0000";

    StaticJsonDocument<256> arrParamDoc;
    String arrParam = "[{\"nama\":\"Proses pertama\", \"suhu\":\"40\", \"kelembapan\":\"50\", \"relay\":\"0\", \"act\":\"on\"},{\"nama\":\"Proses kedua\", \"suhu\":\"30\", \"kelembapan\":\"20\", \"relay\":\"0\",\"act\":\"on\"},{\"nama\":\"Proses ketiga\", \"suhu\":\"25\", \"kelembapan\":\"15\", \"relay\":\"0\",\"act\":\"on\"}]";
    deserializeJson(arrParamDoc, arrParam);
    config["parameter"] = arrParamDoc.as<JsonArray>();

    StaticJsonDocument<256> arrDataDoc;
    String arrData = "[]";
    deserializeJson(arrDataDoc, arrData);
    config["data"] = arrDataDoc.as<JsonArray>();

    StaticJsonDocument<256> arrRelayDoc;
    String arrRelay = "[{\"pin\":1, \"status\":0},{\"pin\":2, \"status\":0},{\"pin\":3, \"status\":0},{\"pin\":4, \"status\":0}]";
    deserializeJson(arrRelayDoc, arrRelay);
    config["relay"] = arrRelayDoc.as<JsonArray>();
    config["mode"] = "off";

    File f = LittleFS.open(CONFIG_FILE, "w");
    serializeJson(config, f);
    f.close();
    return true;
  }

  File file = LittleFS.open(CONFIG_FILE, "r");
  if (!file) return false;

  if (deserializeJson(config, file)) {
    LittleFS.remove(CONFIG_FILE);
    return loadConfig();
  }

  file.close();
  return true;
}

bool saveConfig() {
  File file = LittleFS.open(CONFIG_FILE, "w");
  if (!file) return false;
  serializeJson(config, file);
  file.close();
  return true;
}

unsigned long getCurrentTimestamp() {
  return GlobalTimestamp + (millis() - lastMillis) / 1000;
}

void setupWiFi() {
  WiFi.mode(WIFI_AP_STA);

  // STA
  WiFi.begin(
    config["ssid"].as<String>(),
    config["pwd"].as<String>());

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 10000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("Connected! IP: ");
    Serial.println(WiFi.localIP());
  }

  // AP
  WiFi.softAP(
    config["wifissid"].as<String>(),
    config["wifipwd"].as<String>());
  Serial.print("AP IP: ");
  Serial.println(WiFi.softAPIP());
}

void setTimestampFromPhone(unsigned long phoneTime) {
  GlobalTimestamp = phoneTime;
  lastMillis = millis();
}

String getFormattedTime() {
  time_t now = getCurrentTimestamp();
  struct tm* timeinfo = localtime(&now);

  char buffer[25];
  strftime(buffer, sizeof(buffer), "%Y-%m-%d %H:%M:%S", timeinfo);
  return String(buffer);
}

void addLog(float suhu, float kelembapan, String mode) {
  JsonArray data = config["data"].as<JsonArray>(); 

  JsonObject log = data.createNestedObject();
  log["suhu"] = suhu;
  log["kelembapan"] = kelembapan;
  log["mode"] = mode;
  log["time"] = getFormattedTime();

  saveConfig();
}

void setup() {
  Serial.begin(115200);

  pinMode(relay1, OUTPUT);
  pinMode(relay2, OUTPUT);
  pinMode(relay3, OUTPUT);
  pinMode(relay4, OUTPUT);
  pinMode(MQ05, INPUT);

  LittleFS.begin();
  loadConfig();

  setupWiFi();

  // ⭐ HTTP Routing
  server.on("/sensor", handleSensor);
  server.on("/data", handleGetData);
  server.on("/login", HTTP_POST, handleLogin);
  server.on("/setting", HTTP_POST, handleSetting);
  server.on("/relayon", HTTP_POST, handleRelayOn);
  server.on("/relayoff", HTTP_POST, handleRelayOff);
  server.on("/update", HTTP_POST, handleUpdate);
  server.on("/save", HTTP_POST, handleSave);
  server.on("/proses", HTTP_POST, handleProses);
  server.on("/saveparamater", HTTP_POST, handleUpdateParameter);
  server.on("/setTime", HTTP_POST, handleSetTime);

  server.begin();
  // checkForUpdate();
  Serial.println("HTTP server started!");

  ArduinoOTA.setHostname("esp8266-ku");
  ArduinoOTA.setPassword("1234");

  ArduinoOTA.onStart([]() {
    Serial.println("Start OTA Update...");
  });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {
    Serial.printf("Progress: %u%%\r", (progress / (total / 100)));
  });
  ArduinoOTA.onEnd([]() {
    Serial.println("\nOTA Update Selesai!");
  });
  ArduinoOTA.onError([](ota_error_t error) {
    Serial.printf("Error[%u]\n", error);
  });
  setTimestampFromPhone(1763318400);

  ArduinoOTA.begin();
  Serial.println("OTA Ready. Akses via Arduino IDE → Port → esp8266-ku.local");
}

void loop() {
  server.handleClient();
  ArduinoOTA.handle();

  unsigned long now = millis();
  if (now - lastRuleRun >= 1000) {
    lastRuleRun = now;
    runRules();
  }
}
