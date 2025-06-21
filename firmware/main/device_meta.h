#ifndef DEVICE_META_H
#define DEVICE_META_H
#include <stddef.h>
#include "esp_err.h"

esp_err_t get_device_id(char *out_str, size_t len);

#endif

