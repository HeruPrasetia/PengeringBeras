
void applyRule(String action, String Relay) {
  if (action == "on") {
    if (Relay == "1") digitalWrite(relay1, HIGH);
    if (Relay == "2") digitalWrite(relay2, HIGH);
    if (Relay == "3") digitalWrite(relay3, HIGH);
    if (Relay == "4") digitalWrite(relay4, HIGH);
  } else if (action == "off") {
    if (Relay == "1") digitalWrite(relay1, LOW);
    if (Relay == "2") digitalWrite(relay2, LOW);
    if (Relay == "3") digitalWrite(relay3, LOW);
    if (Relay == "4") digitalWrite(relay4, LOW);
  }
}

float getValue(String var) {
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
  StaticJsonDocument<1024> doc;
  DeserializationError err = deserializeJson(doc, file);
  file.close();
  if (err) return;

  JsonArray rules = config["parameter"];

  for (JsonObject rule : rules) {
    String var = rule["var"];
    String op = rule["op"];
    float value = rule["value"];
    String action = rule["action"];

    float leftVal = getValue(var);

    if (compare(leftVal, op, value)) {
      applyRule(action);
    }
  }
}