# LoRa-Dashboard

Use LoRa compatible Esp32's to send sensor data through AWS IoT core to a React Front-end. Utalize REST, WebSockets and AWS IoT Core to allow remote sensing devices to send data to a React Web App.

- [ ] [Device](docs/device.md): MakerFocus ESP32 LoRa v3 Development Board
- [ ] [Firmware](docs/firmware.md): C++ IoT sensor
- [ ] [AWS IoT Core/DynamoDB](docs/cloud.md)
- [ ] [Backend](docs/backend.md): REST, WebSockets
- [ ] [Frontend](docs/frontend.md): React JS

<div align="center">
    <video controls muted src="https://github.com/user-attachments/assets/97756a8a-2db8-45b8-b298-19100d9e1012"></video>
</div>



## Block Diagram
![Block Diagram](./docs/images/Basic-LoRa-Dashboard-Design.jpg)

## Development Environment Setup (`setup.sh`)

This script bootstraps the entire LoRa Dashboard project for development—including backend, frontend, and ESP32 firmware.

### Features
- On first start creates .env for aws setup and secrets.cmake for ESP32 WiFi credentials.
- Optionally builds, flashes, and monitors ESP32 firmware (requires ESP-IDF toolchain).
- Checks for and installs dependencies for backend (Python virtual env) and starts services (MQTT, DynamoDB, backend API, frontend) using Docker Compose.
- Supports fake device data simulation.

### Requirements
- Docker
- Python 3 + venv
- npm (for frontend)
- AWS CLI
- ESP-IDF (for ESP32 operations, optional)
- mosquitto-clients (for MQTT subscribe utility)

Make sure docker, python3, npm, aws, and (optionally) ESP-IDF toolchains are installed and available in your PATH.

---

### Usage
```sh
chmod +x setup.sh
./setup.sh [OPTIONS]
```
Common options:
- `--backend-only`         Start only backend-related services
- `--frontend-only`        Start only frontend
- `--esp-only`             Run only ESP32 firmware operations (add with --build, --flash, --monitor)
- `--build`                Build ESP32 firmware
- `--flash`                Flash firmware to ESP32
- `--monitor`              Open ESP32 serial monitor
- `--port <dev>`           Specify serial port for ESP32
- `--fake-devices <n>`     Launch N fake devices for test data

Example: Build, flash, and monitor ESP32 only:
```sh
./setup.sh --esp-only --build --flash --monitor
```

Example: Start full stack with 5 fake devices:
```sh
./setup.sh --fake-devices 5
```

On first run, you will be prompted to enter WiFi credentials (for firmware) and AWS/DynamoDB info (for backend).

To stop and clean up, press Ctrl+C.

---

## Extras/Scripts 

###  Clear Table
**What it does:**
- Deletes all items from both tables.
- Seeds 5 random device IDs in the `Devices` table.
- Seeds 30 days (hourly, per device) of random telemetry data in the `Telemetry` table.

**Usage:**
```sh
python scripts/clear_table.py
```

**Requirements:**
- Python 3
- `boto3`
- Local DynamoDB instance running

### Fake Device
**What it does:**
- Simulates one or more devices (with custom or random IDs).
- Customizable publish interval for each device.
- Runs each simulated device in its own thread.
- Displays output and handles errors gracefully.

**Usage:**
```sh
python fake_device.py --count 3 --interval 1.5
```
- `--count`: Number of devices to simulate (default: 1)
- `--interval`: Message publish interval per device, in seconds (default: 2.0)

**Requirements:**
- Python 3
- `paho-mqtt`

**Notes:**
- By default, connects to MQTT broker at `localhost`.
