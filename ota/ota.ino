#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266httpUpdate.h>

// =======================
// SETTING ESP DAN OTA
// =======================
#define WIFI_SSID "GRATIS"
#define WIFI_PASS "Bissmillah123"

#define CURRENT_VERSION "1.0.0"  // versi firmware yang sekarang
#define VERSION_URL "https://apis.naylatools.com/iot/versions.txt"
#define UPDATE_URL "https://apis.naylatools.com/iot/update.ino.bin"

// Timer cek update
unsigned long lastCheck = 0;

// =======================
// CONNECT WIFI
// =======================
void connectWiFi() {
  Serial.print("WiFi Connecting ");
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  int timeout = 0;
  while (WiFi.status() != WL_CONNECTED && timeout < 30) {
    delay(500);
    Serial.print(".");
    timeout++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\nWiFi Connected!");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\nWiFi Failed!");
  }
}

// =======================
// OTA UPDATE FUNCTION
// =======================
void doOTAUpdate() {
  Serial.println("Downloading firmware...");
  t_httpUpdate_return ret = ESPhttpUpdate.update(UPDATE_URL);

  switch (ret) {
    case HTTP_UPDATE_FAILED:
      Serial.printf("Update Failed! %s\n", ESPhttpUpdate.getLastErrorString().c_str());
      break;

    case HTTP_UPDATE_NO_UPDATES:
      Serial.println("Firmware sudah terbaru.");
      break;

    case HTTP_UPDATE_OK:
      Serial.println("Update sukses! Restart...");
      break;
  }
}

// =======================
// CHECK VERSION FUNCTION
// =======================
void checkForUpdate() {
  if (WiFi.status() != WL_CONNECTED) return;

  HTTPClient http;
  http.begin(VERSION_URL);
  int code = http.GET();

  if (code == 200) {
    String latest = http.getString();
    latest.trim();

    Serial.println("Current Version: " + String(CURRENT_VERSION));
    Serial.println("Latest Version : " + latest);

    if (latest != CURRENT_VERSION) {
      Serial.println("Update tersedia! Mulai OTA...");
      doOTAUpdate();
    } else {
      Serial.println("Tidak ada update.");
    }

  } else {
    Serial.println("Gagal cek versi.");
  }

  http.end();
}

// =======================
// SETUP
// =======================
void setup() {
  Serial.begin(115200);

  connectWiFi();     // konek WiFi
  checkForUpdate();  // cek update saat boot
}

// =======================
// LOOP
// =======================
void loop() {

  // cek update tiap 1 jam
  if (millis() - lastCheck > 3600000) {
    lastCheck = millis();
    checkForUpdate();
  }

  // kode lain bebas taruh sini
}
