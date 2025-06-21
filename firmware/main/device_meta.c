#include "device_meta.h"
#include "esp_system.h"  // for esp_efuse_mac_get_default
#include "esp_mac.h"
#include <stdio.h>

esp_err_t get_device_id(char *out_str, size_t len) {
    if (len < 13) {  // MAC address as a string needs 12 characters + '\0'
        return ESP_ERR_INVALID_SIZE;
    }

    uint8_t mac[6];
    esp_err_t err = esp_efuse_mac_get_default(mac);
    if (err != ESP_OK) {
        return err; // Return the error code if obtaining the MAC fails
    }

    snprintf(out_str, len, "%02X%02X%02X%02X%02X%02X",
             mac[0], mac[1], mac[2], mac[3],
             mac[4], mac[5]);

    return ESP_OK;
}

