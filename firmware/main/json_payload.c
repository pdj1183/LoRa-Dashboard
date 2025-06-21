#include "json_payload.h"
#include "cJSON.h"
#include "esp_timer.h"
#include "esp_log.h"

#define TAG "JSON"

char *generate_telemetry_json(const char *device_id, float temperature) {
    cJSON *root = cJSON_CreateObject();
    if (root == NULL) {
        ESP_LOGE(TAG, "Failed to create JSON object");
        return NULL;
    }

    if (!cJSON_AddStringToObject(root, "device_id", device_id)) {
        ESP_LOGE(TAG, "Failed to add device_id to JSON");
        cJSON_Delete(root);
        return NULL;
    }

    if (!cJSON_AddNumberToObject(root, "temperature", temperature)) {
        ESP_LOGE(TAG, "Failed to add temperature to JSON");
        cJSON_Delete(root);
        return NULL;
    }

    int64_t ms = esp_timer_get_time() / 1000;
    if (!cJSON_AddNumberToObject(root, "uptime_ms", ms)) {
        ESP_LOGE(TAG, "Failed to add uptime to JSON");
        cJSON_Delete(root);
        return NULL;
    }

    char *out_str = cJSON_PrintUnformatted(root);
    if (out_str == NULL) {
        ESP_LOGE(TAG, "Failed to print JSON");
    }
    
    cJSON_Delete(root);
    return out_str;
}

