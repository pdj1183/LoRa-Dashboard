#include "sensor_task.h"

#include <stdio.h>

#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "json_payload.h"
#include "mqtt.h"

static void sensor_loop(void *arg) {
    const char *device_id = (const char *)arg;

    while (1) {
        float temperature = 28.0;
        ESP_LOGI("sensor_task", "Simulated Temp: %.2f°C", temperature);

        // generate JSON
        char *json_str = generate_telemetry_json(device_id, temperature);
        if (json_str == NULL) {
            ESP_LOGE("sensor_task", "Failed to create JSON");
        } else {
            mqtt_send_telemetry_json(json_str);
            free(json_str);
        }

        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}

void start_sensor_task(const char *device_id) { xTaskCreate(sensor_loop, "sensor_task", 4096, (void *)device_id, 5, NULL); }
