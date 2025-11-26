// =============================
// 📌 ROUTE HTTP SERVER
// =============================

void handleSensor() {
  StaticJsonDocument<256> doc;

  int nilai = analogRead(MQ05);
  int persen = map(nilai, 1023, 0, 0, 100);

  if (millis() - lastDhtRead > 5000) {
    lastDhtRead = millis();
    suhu = dht11.readTemperature();
  }

  doc["status"] = "sukses";
  doc["act"] = "sensor";
  doc["suhu"] = suhu;
  doc["kelembapan"] = persen;
  doc["mode"] = config["mode"];
  doc["relay"] = config["relay"];
  doc["data"] = config["data"];

  String out;
  serializeJson(doc, out);
  server.send(200, "application/json", out);
}

void handleLogin() {
  StaticJsonDocument<256> doc;
  deserializeJson(doc, server.arg("plain"));

  String u = doc["Username"];
  String p = doc["Pwd"];


  StaticJsonDocument<128> reply;

  if (u == config["username"].as<String>() && p == config["userpwd"].as<String>()) {
    reply["status"] = "sukses";
    reply["act"] = "login";
    reply["pesan"] = "initoken";
  } else {
    Serial.println("User : " + config["username"].as<String>());
    Serial.println("Pwd : " + config["userpwd"].as<String>());
    Serial.println("Users : " + u);
    Serial.println("Pwds : " + p);
    reply["status"] = "gagal";
    reply["act"] = "login";
    reply["pesan"] = "Username atau password salah";
  }

  String out;
  serializeJson(reply, out);
  server.send(200, "application/json", out);
}

void handleRelayOn() {
  StaticJsonDocument<256> doc;
  deserializeJson(doc, server.arg("plain"));
  int id = doc["id"];

  if (id < 1 || id > 4) {
    server.send(400, "application/json", "{\"status\":\"gagal\",\"pesan\":\"ID invalid " + server.arg("id") + "\"}");
    return;
  }

  // Set hardware relay
  uint8_t pinRelay[] = { relay1, relay2, relay3, relay4 };
  digitalWrite(pinRelay[id - 1], HIGH);

  // pastikan config["relay"] adalah array valid
  if (!config["relay"].is<JsonArray>()) {
    Serial.println("Initialize relay array...");
    JsonArray arr = config.createNestedArray("relay");

    for (int i = 0; i < 4; i++) {
      JsonObject obj = arr.createNestedObject();
      obj["pin"] = i + 1;
      obj["status"] = 0;
    }
  }

  JsonArray arr = config["relay"].as<JsonArray>();

  if (id - 1 < arr.size()) {
    arr[id - 1]["status"] = 1;
  } else {
    Serial.println("Relay index out of range!");
  }

  saveConfig();

  String relayJson;
  serializeJson(arr, relayJson);

  server.send(200, "application/json",
              "{\"status\":\"sukses\", \"relay\":" + relayJson + "}");
}

void handleRelayOff() {
  StaticJsonDocument<256> doc;
  deserializeJson(doc, server.arg("plain"));
  int id = doc["id"];

  if (id < 1 || id > 4) {
    server.send(400, "application/json", "{\"status\":\"gagal\",\"pesan\":\"ID invalid " + server.arg("id") + "\"}");
    return;
  }

  // Set hardware relay
  uint8_t pinRelay[] = { relay1, relay2, relay3, relay4 };
  digitalWrite(pinRelay[id - 1], LOW);

  // pastikan config["relay"] adalah array valid
  if (!config["relay"].is<JsonArray>()) {
    Serial.println("Initialize relay array...");
    JsonArray arr = config.createNestedArray("relay");

    for (int i = 0; i < 4; i++) {
      JsonObject obj = arr.createNestedObject();
      obj["pin"] = i + 1;
      obj["status"] = 0;
    }
  }

  JsonArray arr = config["relay"].as<JsonArray>();

  if (id - 1 < arr.size()) {
    arr[id - 1]["status"] = 0;
  } else {
    Serial.println("Relay index out of range!");
  }

  saveConfig();

  String relayJson;
  serializeJson(arr, relayJson);

  server.send(200, "application/json", "{\"status\":\"sukses\", \"relay\":" + relayJson + "}");
}

void handleUpdate() {
  StaticJsonDocument<512> doc;
  deserializeJson(doc, server.arg("plain"));

  String key = doc["key"];
  String val = doc["value"];

  config[key] = val;
  saveConfig();

  server.send(200, "application/json", "{\"status\":\"sukses\"}");
}

void handleUpdateParameter() {
  StaticJsonDocument<1024> incoming;
  deserializeJson(incoming, server.arg("plain"));

  JsonArray newParams = incoming["Params"].as<JsonArray>();

  config["parameter"].clear();

  for (JsonVariant v : newParams) {
    if (v) {
      config["parameter"].add(v);
    }
  }

  saveConfig();

  server.send(200, "application/json", "{\"status\":\"sukses\"}");
}

void handleSave() {
  deserializeJson(config, server.arg("plain"));
  saveConfig();
  server.send(200, "application/json", "{\"status\":\"sukses\"}");
}

void handleProses() {
  StaticJsonDocument<256> doc;
  deserializeJson(doc, server.arg("plain"));
  int nilai = analogRead(MQ05);
  int persen = map(nilai, 1023, 0, 0, 100);

  if (millis() - lastDhtRead > 5000) {
    lastDhtRead = millis();
    suhu = dht11.readTemperature();
  }


  config["mode"] = doc["mode"].as<String>();
  saveConfig();

  addLog(suhu, persen, doc["mode"].as<String>());

  server.send(200, "application/json", "{\"status\":\"sukses\", \"pesan\":\"Berhasil ganti proses\"}");
}

void handleGetData() {
  String jsonStr;
  serializeJson(config, jsonStr);
  server.send(200, "application/json", "{\"status\":\"sukses\", \"act\":\"data\", \"data\": " + jsonStr + "}");
}

void handleSetting() {
  StaticJsonDocument<256> doc;
  deserializeJson(doc, server.arg("plain"));

  String ssid = doc["ssid"] | "";
  String pwd = doc["pwd"] | "";
  String wifissid = doc["wifissid"] | "";
  String wifipwd = doc["wifipwd"] | "";
  String kalibrasi = doc["kalibrasi"] | "0";
  config["ssid"] = ssid;
  config["pwd"] = pwd;
  config["wifissid"] = wifissid;
  config["wifipwd"] = wifipwd;
  config["kalibrasi"] = kalibrasi;

  saveConfig();
  server.send(200, "application/json", "{\"status\":\"sukses\", \"pesan\":\"Berhasil Edit Setting\"}");
}

void handleSetTime() {
  StaticJsonDocument<128> doc;
  deserializeJson(doc, server.arg("plain"));
  unsigned long t = doc["time"].as<unsigned long>();
  setTimestampFromPhone(t);
  server.send(200, "application/json", "{\"status\":\"sukses\"}");
}