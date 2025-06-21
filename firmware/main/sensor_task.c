#include "sensor_task.h"

#include <stdio.h>

#include "esp_log.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "json_payload.h"
#include "mqtt.h"

static const char *TAG = "sensor_task";

static void sensor_loop(void *arg) {
    const char *device_id = (const char *)arg;

    while (1) {
        // Simulate reading a temperature sensor
        float temperature = 28.0;
        ESP_LOGI(TAG, "Simulated Temp: %.2f°C", temperature);

        // Generate JSON
        char *json_str = generate_telemetry_json(device_id, temperature);
        if (json_str == NULL) {
            ESP_LOGE(TAG, "Failed to create JSON");
        } else {
            mqtt_send_telemetry_json(json_str);
            free(json_str);
        }

        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}

// Update function to return esp_err_t
esp_err_t start_sensor_task(const char *device_id) {
    if (device_id == NULL) {
        ESP_LOGE(TAG, "Invalid device ID provided to start_sensor_task");
        return ESP_ERR_INVALID_ARG;
    }

    BaseType_t result = xTaskCreate(sensor_loop, "sensor_task", 4096, (void *)device_id, 5, NULL);
    if (result != pdPASS) {
        ESP_LOGE(TAG, "Failed to create sensor task");
        return ESP_FAIL;
    }

    ESP_LOGI(TAG, "Sensor task started successfully");
    return ESP_OK;
}

