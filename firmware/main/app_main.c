#include <stdio.h>

#include "freertos/FreeRTOS.h"
#include "freertos/task.h"

#include "sensor_task.h"

void app_main(void) {
    printf("Hello world!\n");
    start_sensor_task();
}
