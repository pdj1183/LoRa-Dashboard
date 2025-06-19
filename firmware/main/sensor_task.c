#include <stdio.h>

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "sensor_task.h"

static void sensor_loop(void *arg) {
    while (1) {
        printf("[sensor_task] Simulated temp: %.2f°C\n", 28.0);  // placeholder
        vTaskDelay(pdMS_TO_TICKS(1000));
    }
}

void start_sensor_task(void) { xTaskCreate(sensor_loop, "sensor_task", 2048, NULL, 5, NULL); }
