void doOTAUpdate() {
  Serial.println("🔍 Cek update firmware...");

  WiFiClient client;

  t_httpUpdate_return ret = ESPhttpUpdate.update(
    client,
    UPDATE_URL,      // URL bin
    CURRENT_VERSION  // versi sekarang
  );

  switch (ret) {
    case HTTP_UPDATE_FAILED:
      Serial.printf("❌ Update gagal! Error (%d): %s\n",
                    ESPhttpUpdate.getLastError(),
                    ESPhttpUpdate.getLastErrorString().c_str());
      break;

    case HTTP_UPDATE_NO_UPDATES:
      Serial.println("ℹ️ Tidak ada update.");
      break;

    case HTTP_UPDATE_OK:
      Serial.println("✅ Update sukses!");
      break;
  }
}


void checkForUpdate() {
  WiFiClient client;
  HTTPClient http;

  Serial.println("🔍 Cek versi terbaru...");

  if (!http.begin(client, VERSION_URL)) {
    Serial.println("❌ Gagal inisialisasi HTTP!");
    return;
  }

  int httpCode = http.GET();

  if (httpCode != 200) {
    Serial.printf("❌ Gagal ambil versi, code: %d\n", httpCode);
    http.end();
    return;
  }

  String latestVersion = http.getString();
  latestVersion.trim();

  Serial.println("📢 Versi terbaru: " + latestVersion);
  Serial.println("📦 Versi sekarang: " + String(CURRENT_VERSION));

  if (latestVersion != CURRENT_VERSION) {
    Serial.println("⬆️ Update tersedia! Memulai OTA...");
    doOTAUpdate();
  } else {
    Serial.println("✔️ Firmware sudah paling baru");
  }

  http.end();
}