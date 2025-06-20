| Supported Targets | ESP32-S3 |
| ----------------- | -------- |

# LoRa Sensor Firmware
Simple firmware that will initialize a device_id and connect to Wifi. After connectiing the device will start sending out MQTT messages containing data from a "sensor loop".
Currently the sensor isn't implemented but the loop will output 28 degrees celsius. 

I am looking to add display output and device configuration over the air.

Uses esp-idf so that is required to build/flash.


## How to use example

idf.py build
idf.py flash
idf.py monitor

## Project contents

The project's main source file in C language [app_main.c](main/app_main.c) is located in folder [main](main).

ESP-IDF projects are built using CMake. The project build configuration is contained in `CMakeLists.txt` files that provide set of directives and instructions describing the project's source files and targets (executable, library, or both).

Below is short explanation of remaining files in the project folder.

```
├── CMakeLists.txt
├── include
│   ├── secrets.cmake
├── tests
│   ├── pytest_app_main.py
├── main
│   ├── CMakeLists.txt
│   └── device_meta.c
│   └── device_meta.h
│   └── json_payload.c
│   └── json_payload.h
│   └── mqtt.c
│   └── mqtt.h
│   └── sensor_task.c
│   └── sensor_task.h
│   └── wifi.c
│   └── wifi.h
└── README.md                  This is the file you are currently reading
```

### device_meta

Generates a device_id from the devices mac address.

### json_payload

jsonifys sensor output and device_id and its uptime.

### mqtt

Initializes and starts the MQTT app. Also contains the function to send out MQTT messages.

### sensor_task

Defines the sensor loop where it will "read" sensor output of 28 degrees.
Calls generate_telemetry_json and mqtt_send_telemetry to format sensor output and send it.

Might reformat so that those are done in main app but we will see.

### wifi

Attempts to connect to Wifi so that the device is able to send out it's MQTT messages.
