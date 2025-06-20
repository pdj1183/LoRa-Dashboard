#include "json_payload.h"
#include "cJSON.h"
#include "esp_timer.h"

char *generate_telemetry_json(const char *device_id, float temperature) {
    cJSON *root = cJSON_CreateObject();
    cJSON_AddStringToObject(root, "device_id", device_id);
    cJSON_AddNumberToObject(root, "temperature", temperature);

    // Optional: add "uptime" seconds
    int64_t ms = esp_timer_get_time() / 1000;
    cJSON_AddNumberToObject(root, "uptime_ms", ms);

    char *out_str = cJSON_PrintUnformatted(root);
    cJSON_Delete(root);
    return out_str;
}

