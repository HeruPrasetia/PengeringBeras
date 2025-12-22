int relays[] = { relay1, relay2, relay3, relay4 };

void applyRule(String action, int Relay) {
  digitalWrite(relays[Relay], (action == "on") ? HIGH : LOW);
}

float getValue(String var) {
  int nilai = analogRead(MQ05);
  int kelembaban = map(nilai, 1023, 0, 0, 100);

  if (millis() - lastDhtRead > 5000) {
    lastDhtRead = millis();
    suhu = dht11.readTemperature();
  }
  if (var == "suhu") return suhu;
  if (var == "kelembaban") return kelembaban;
  return 0;
}

bool compare(float left, String op, float right) {
  if (op == ">") return left > right;
  if (op == "<") return left < right;
  if (op == ">=") return left >= right;
  if (op == "<=") return left <= right;
  if (op == "==") return left == right;
  if (op == "!=") return left != right;
  return false;
}

void runRules() {
  JsonArray rules = config["parameter"];
  int Kalibrasi = config["kalibrasi"];
  int nilai = analogRead(MQ05);
  int kelembaban = map(nilai, 1023, 0, 0, 100) + Kalibrasi;
  String Mode = config["mode"];
  if (millis() - lastDhtRead > 5000) {
    lastDhtRead = millis();
    suhu = dht11.readTemperature();
  }
  if (Mode != "off") {
    if (Mode == "Proses Berlangsung") {
      JsonObject firstRule = rules[0];
      int relay = firstRule["relay"];
      String act = firstRule["act"];
      String Nama = firstRule["nama"];
      applyRule(act, relay);
      if (Mode != Nama) {
        config["mode"] = Nama;
        saveConfig();
        addLog(suhu, kelembaban, Nama);
      }
    }

    for (JsonObject rule : rules) {
      int ParamSuhu = rule["suhu"];
      int ParamKelembapan = rule["kelembapan"];
      int relay = rule["relay"];
      String act = rule["act"];
      String Nama = rule["nama"];

      if (kelembaban < ParamKelembapan) {
        applyRule(act, relay);
        if (Mode != Nama) {
          config["mode"] = Nama;
          saveConfig();
          addLog(suhu, kelembaban, Nama);
        }
      }
    }
  }
}