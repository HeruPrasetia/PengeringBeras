#include <LittleFS.h>

void setup() {
  Serial.begin(115200);
  if (!LittleFS.begin()) {
    Serial.println("Gagal mount LittleFS!");
    return;
  }

  Serial.println("Formatting LittleFS...");
  LittleFS.format();
  Serial.println("Done!");
}

void loop() {}
