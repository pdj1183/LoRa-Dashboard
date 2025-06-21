#pragma once
#include "esp_err.h"

// Initializes MQTT and stores the device ID for topic formatting
esp_err_t mqtt_app_start(const char *device_id);

// Publishes a raw JSON string to the only device's telemetry topic
void mqtt_send_telemetry_json(const char *json_str);

