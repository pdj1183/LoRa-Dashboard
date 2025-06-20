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

void app_main(void) {
    printf("Device Booting up...\n");

    // 🔧 Initialize important system components:
    ESP_ERROR_CHECK(nvs_flash_init());
    ESP_ERROR_CHECK(esp_netif_init());
    ESP_ERROR_CHECK(esp_event_loop_create_default());

    // Connect to chosen network interface (menuconfig chooses Wi-Fi/Ethernet)

    // Get device_id
    static char device_id_storage[20];
    get_device_id(device_id_storage, sizeof(device_id_storage));
    ESP_LOGI("BOOT", "Device ID: %s", device_id_storage);

    nvs_flash_init();  // this is important in wifi case to store configurations , code will not
                       // work if this is not added
    wifi_connection();

    vTaskDelay(10000 /portTICK_PERIOD_MS);

    // Start MQTT
    mqtt_app_start(device_id_storage);

    // Sensor loop
    start_sensor_task(device_id_storage);
}
