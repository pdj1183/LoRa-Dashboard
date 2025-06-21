#include "mqtt.h"
#include <stdio.h>
#include <string.h>
#include "esp_log.h"
#include "mqtt_client.h"

static const char *TAG = "mqtt_client";

// Store device_id passed in at startup for topic formatting
static char s_device_id[32] = {0};

// Keep track of the MQTT client handle globally
static esp_mqtt_client_handle_t s_mqtt_client = NULL;

static void mqtt_event_handler(void *handler_args, esp_event_base_t base, int32_t event_id,
                               void *event_data) {
    ESP_LOGD(TAG, "Event dispatched from event loop base=%s, event_id=%" PRIi32 "", base, event_id);
    esp_mqtt_event_handle_t event = event_data;

    switch (event->event_id) {
        case MQTT_EVENT_CONNECTED:
            ESP_LOGI(TAG, "MQTT_EVENT_CONNECTED");
            break;
        case MQTT_EVENT_DISCONNECTED:
            ESP_LOGW(TAG, "MQTT_EVENT_DISCONNECTED");
            break;
        case MQTT_EVENT_ERROR:
            ESP_LOGE(TAG, "MQTT_EVENT_ERROR");
            break;
        default:
            ESP_LOGI(TAG, "Other MQTT event id: %d", event->event_id);
            break;
    }
}

esp_err_t mqtt_app_start(const char *device_id) {
    // Save the ID for later use (e.g., in publish)
    snprintf(s_device_id, sizeof(s_device_id), "%s", device_id);

    esp_mqtt_client_config_t mqtt_cfg = {
        .broker = {.address = {.uri = "mqtt://192.168.1.22:1883"}}
    };

    s_mqtt_client = esp_mqtt_client_init(&mqtt_cfg);
    if (s_mqtt_client == NULL) {
        ESP_LOGE(TAG, "Failed to init MQTT client");
        return ESP_FAIL;
    }

    esp_mqtt_client_register_event(s_mqtt_client, ESP_EVENT_ANY_ID, mqtt_event_handler, NULL);
    
    esp_err_t err = esp_mqtt_client_start(s_mqtt_client);
    if (err != ESP_OK) {
        ESP_LOGE(TAG, "Failed to start MQTT client: %s", esp_err_to_name(err));
        return err;
    }

    ESP_LOGI(TAG, "MQTT client started successfully");
    return ESP_OK;
}

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

