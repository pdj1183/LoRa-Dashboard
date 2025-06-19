idf_component_register(SRCS "app_main.c" "sensor_task.c"
                    PRIV_REQUIRES spi_flash
                    INCLUDE_DIRS ".")
