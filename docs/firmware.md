# LoRa Dashboard – Firmware

This is the **firmware** for the ESP32 LoRa device used in the LoRa Dashboard project. It collects simulated sensor data and sends telemetry over MQTT to a local broker, where the backend processes and stores it for visualization.

---

## Features

- Connects to Wi-Fi and MQTT broker
- Reads **simulated temperature** sensor data (e.g., `28°C`)
- Publishes telemetry as **JSON** to topic:  
  `lora/devices/{device_id}/telemetry`
- Modular architecture using ESP-IDF
- Automatically generates a unique `device_id` from the MAC address

---

##  Project Structure

```bash
firmware/
├── main/
│   ├── device_meta.c/.h     # MAC-based device ID
│   ├── json_payload.c/.h    # Builds JSON strings
│   ├── mqtt.c/.h            # MQTT init + publish logic
│   ├── sensor_task.c/.h     # Simulated sensor + loop
│   ├── wifi.c/.h            # Wi-Fi connection logic
│   └── main.c               # Entry point and app setup
├── CMakeLists.txt
├── sdkconfig
└── partitions.csv

```

---

## How It Works
1.	Connects to a predefined Wi-Fi network
2.	Connects to MQTT broker (mqtt://...)
3.	Creates a device_id using the MAC address
4.	Every 30 minutes (simulated loop), reads a fake temperature
5.	Formats the data as JSON
6.	Publishes it to: lora/devices/{device_id}/telemetry

---

## Local Development

Use the setup.sh to automate the startup.
```bash
./setup.sh --esp-only --build --flash --monitor
```

To run manually:
```bash
source $HOME/esp/esp-idf/export.sh ## Get esp-idf

idf.py build ## Build the Firmware
idf.py flash ## Flash the Firmware to device
idf.py monitor ## Monitor the device logging
```
##### Install dependencies

Requires esp-idf

---
 
## MQTT Telemetry Format

Example published JSON:
```json
{"device_id":"FAKE_DEVICE_5","temperature":27.07,"uptime_ms":11000,"timestamp":1751243351590}
```

Topic:
```
lora/devices/esp32-AB12CD/telemetry
```

MQTT Publish function:
```c
void mqtt_send_telemetry_json(const char *json_str) {
    if (s_mqtt_client == NULL || json_str == NULL) {
        ESP_LOGW(TAG, "MQTT client not ready or JSON is null");
        return;
    }

    char topic[128];
    snprintf(topic, sizeof(topic), "lora/devices/%s/telemetry", s_device_id);

    int msg_id = esp_mqtt_client_publish(s_mqtt_client, topic, json_str, 0, 1, 0);
    if (msg_id != -1) {
        ESP_LOGI(TAG, "Published telemetry (msg_id=%d): %s", msg_id, json_str);
    } else {
        ESP_LOGE(TAG, "Failed to publish telemetry");
    }
}
```

---

## Local Testing

You can use mosquitto_sub to watch messages coming from your device:
```bash
mosquitto_sub -h localhost -t "lora/devices/#" -v
```
