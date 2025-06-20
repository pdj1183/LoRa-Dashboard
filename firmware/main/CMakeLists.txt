idf_component_register(SRCS
                       "app_main.c"
                       "sensor_task.c"
                       "device_meta.c"
                       "json_payload.c"
                       "mqtt.c"
                       "wifi.c" PRIV_REQUIRES spi_flash esp_netif esp_wifi nvs_flash esp_event mqtt json INCLUDE_DIRS ".")
