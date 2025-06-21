#include <stdio.h>

#include "device_meta.h"
#include "esp_event.h"
#include "esp_log.h"
#include "esp_netif.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "json_payload.h"
#include "mqtt.h"
#include "nvs_flash.h"
#include "sensor_task.h"
#include "wifi.h"

#define WIFI_RETRY_MAX 5
#define TAG "BOOT"

void app_main(void) {
    esp_err_t ret;

    printf("Device Booting up...\n");

    // Initialize important system components:
    ret = nvs_flash_init();
    if (ret == ESP_ERR_NVS_NO_FREE_PAGES || ret == ESP_ERR_NVS_NEW_VERSION_FOUND) {
        ESP_ERROR_CHECK(nvs_flash_erase());
        ret = nvs_flash_init();
    }
    ESP_ERROR_CHECK(ret);

    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    // Get device_id
    static char device_id_storage[20];
    if (get_device_id(device_id_storage, sizeof(device_id_storage)) != ESP_OK) {
        ESP_LOGE(TAG, "Failed to get device ID");
        return;
    }
    ESP_LOGI(TAG, "Device ID: %s", device_id_storage);

    // Wi-Fi Connection
    int wifi_retry_count = 0;
    while (wifi_connection() != ESP_OK && wifi_retry_count < WIFI_RETRY_MAX) {
        ESP_LOGW(TAG, "Wi-Fi connection attempt %d/%d failed, retrying...", wifi_retry_count + 1, WIFI_RETRY_MAX);
        wifi_retry_count++;
        vTaskDelay(5000 / portTICK_PERIOD_MS);
    }

    if (wifi_retry_count == WIFI_RETRY_MAX) {
        ESP_LOGE(TAG, "Failed to connect to Wi-Fi after %d attempts", WIFI_RETRY_MAX);
        return;
    }

    vTaskDelay(10000 / portTICK_PERIOD_MS);

    // Start MQTT with error handling
    if (mqtt_app_start(device_id_storage) != ESP_OK) {
        ESP_LOGE(TAG, "Failed to start MQTT");
        return;
    }

    // Sensor loop with error handling
    if (start_sensor_task(device_id_storage) != ESP_OK) {
        ESP_LOGE(TAG, "Failed to start sensor task");
        return;
    }
}

