#include "device_meta.h"
#include "esp_system.h"  // for esp_efuse_mac_get_default
#include "esp_mac.h"
#include <stdio.h>

void get_device_id(char *out_str, size_t len) {
    uint8_t mac[6];
    esp_efuse_mac_get_default(mac);
    snprintf(out_str, len, "%02X%02X%02X%02X%02X%02X",
             mac[0], mac[1], mac[2], mac[3],
             mac[4], mac[5]);
}

