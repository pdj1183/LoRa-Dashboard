#!/bin/bash
set -e

# Colors
cyan=$(tput setaf 6)
green=$(tput setaf 2)
red=$(tput setaf 1)
reset=$(tput sgr0)

# Execution flags
START_BACKEND=true
START_FRONTEND=true
ESP_ONLY=false
FAKE_DEVICES_COUNT=0

# ESP32 flags
ESP_ACTION_REQUESTED=false
ESP_BUILD=false
ESP_FLASH=false
ESP_MONITOR=false
ESP_PORT=""

# Parse args
while [[ "$#" -gt 0 ]]; do
    case $1 in
        --backend-only)
            START_FRONTEND=false ;;
        --frontend-only)
            START_BACKEND=false ;;
        --esp-only)
            START_BACKEND=false
            START_FRONTEND=false
            ESP_ONLY=true
            ESP_ACTION_REQUESTED=true ;;
        --build)
            ESP_BUILD=true
            ESP_ACTION_REQUESTED=true ;;
        --flash)
            ESP_FLASH=true
            ESP_ACTION_REQUESTED=true ;;
        --monitor)
            ESP_MONITOR=true
            ESP_ACTION_REQUESTED=true ;;
        --port)
            ESP_PORT="$2"
            shift ;;
        --fake-devices)
            FAKE_DEVICES_COUNT="$2"
            shift ;;
        *)
            echo "Unknown option: $1"
            echo "Usage: ./setup.sh [--backend-only|--frontend-only|--esp-only] [--build] [--flash] [--monitor] [--port <path>] [--fake-devices <num>]"
            exit 1 ;;
    esac
    shift
done

# Prompt for secrets.cmake
SECRETS_FILE="firmware/include/secrets.cmake"
if [ ! -f "$SECRETS_FILE" ]; then
    mkdir -p firmware/include
    default_ssid="SSID"
    default_pwd="PASSWORD"
    read -p "Enter WiFi SSID [${default_ssid}]: " ssid
    ssid=${ssid:-$default_ssid}
    read -p "Enter WiFi PASSWORD [${default_pwd}]: " pwd
    pwd=${pwd:-$default_pwd}
    cat > "$SECRETS_FILE" <<EOF
set(WIFI_SSID "\"$ssid\"")
set(WIFI_PASSWORD "\"$pwd\"")
EOF
    echo "${green}Created $SECRETS_FILE with your WiFi credentials.${reset}"
fi

# Prompt for backend/.env
ENV_FILE="backend/.env"
if [ ! -f "$ENV_FILE" ]; then
    mkdir -p backend
    default_region="us-west-1"
    default_key="your_access_key"
    default_secret="your_secret_key"
    default_endpoint="http://localhost:8000"
    default_mqtt="mqtt"

    read -p "Enter AWS Region [${default_region}]: " region
    region=${region:-$default_region}
    read -p "Enter AWS Access Key ID [${default_key}]: " keyid
    keyid=${keyid:-$default_key}
    read -p "Enter AWS Secret Access Key [${default_secret}]: " accesskey
    accesskey=${accesskey:-$default_secret}
    read -p "Enter DynamoDB endpoint [${default_endpoint}]: " endpoint
    endpoint=${endpoint:-$default_endpoint}
    read -p "Enter MQTT_BROKER [${default_mqtt}]: " mqtt
    mqtt=${mqtt:-$default_mqtt}

    cat > "$ENV_FILE" <<EOF
AWS_REGION=$region
AWS_ACCESS_KEY_ID=$keyid
AWS_SECRET_ACCESS_KEY=$accesskey
DYNAMODB_ENDPOINT=$endpoint
MQTT_BROKER=$mqtt
EOF
    echo "${green}Created $ENV_FILE with configured AWS/DynamoDB info.${reset}"
fi

echo "${cyan}FAKE_DEVICES_COUNT = $FAKE_DEVICES_COUNT${reset}"

# Print selected modes
MODE_STRING=""
$START_BACKEND && MODE_STRING+="backend "
$START_FRONTEND && MODE_STRING+="+ frontend "
$ESP_ONLY && MODE_STRING+="(ESP-only mode)"
echo "${cyan}LoRa Dashboard Dev Setup Mode: ${green}${MODE_STRING}${reset}"

# Check system dependencies
check_command() {
    if ! command -v "$1" &>/dev/null; then
        echo "${red}Missing: $1 - please install it.${reset}"
        exit 1
    fi
}

echo "${cyan}Checking required tools...${reset}"
for cmd in docker python3 pip npm aws; do check_command $cmd; done

# ESP-IDF environment setup
ESP_IDF_READY=false

if [ "$ESP_ACTION_REQUESTED" = true ]; then
    if command -v idf.py &> /dev/null; then
        ESP_IDF_READY=true
    elif [ -f "$HOME/esp/esp-idf/export.sh" ]; then
        echo "${cyan}Sourcing ESP-IDF environment...${reset}"
        . "$HOME/esp/esp-idf/export.sh"
        if command -v idf.py &> /dev/null; then
            ESP_IDF_READY=true
        else
            echo "${red}ESP-IDF sourcing failed — idf.py still not found.${reset}"
        fi
    else
        echo "${red}ESP-IDF export.sh not found at \$HOME/esp/esp-idf/. ESP toolchain won't be available.${reset}"
    fi
fi

# ESP32 Serial Port Detection (cross-platform)
detect_esp_port() {
    if [[ "$(uname -s)" == "Darwin" ]]; then
        PORT=$(ls /dev/tty.usb* 2>/dev/null | head -n 1)
    elif [[ "$(uname -s)" == "Linux" ]]; then
        PORT=$(ls /dev/ttyUSB* /dev/ttyACM* 2>/dev/null | head -n 1)
    elif [[ "$(uname -s)" == "MINGW"* || "$(uname -s)" == "CYGWIN"* || "$(uname -s)" == "MSYS_NT"* ]]; then
        # For git-bash or cygwin on windows
        PORT=$(ls /dev/ttyS* /dev/ttyUSB* 2>/dev/null | head -n 1)
        # User may need to provide --port "COMx"
    fi
    echo "$PORT"
}

# Run ESP32 actions if asked
if $ESP_ACTION_REQUESTED && $ESP_IDF_READY; then
    FIRMWARE_DIR="$(pwd)/firmware"
    if [ ! -d "$FIRMWARE_DIR" ]; then
        echo "${red}Firmware directory not found: $FIRMWARE_DIR${reset}"
    else
        if [ -z "$ESP_PORT" ]; then
            ESP_PORT=$(detect_esp_port)
        fi

        if [ -z "$ESP_PORT" ]; then
            echo "${cyan}No ESP32 device detected (no serial port found). Skipping ESP32 actions.${reset}"
        else
            cd "$FIRMWARE_DIR"
            [ -f "$HOME/esp/esp-idf/export.sh" ] && source "$HOME/esp/esp-idf/export.sh"
            $ESP_BUILD   && idf.py -f build
            $ESP_FLASH   && idf.py -p "$ESP_PORT" flash
            $ESP_MONITOR && idf.py -p "$ESP_PORT" monitor
            cd - > /dev/null
        fi
    fi
fi

# Setup backend: Python deps + Docker
if $START_BACKEND; then
    if [ ! -d ".venv" ]; then
        echo "${cyan}Creating Python virtualenv...${reset}"
        python3 -m venv .venv
    fi
    echo "${cyan}Activating venv and installing Python dependencies...${reset}"
    source .venv/bin/activate
    pip install --upgrade pip
    pip install boto3 fastapi uvicorn
fi

# Start Docker containers based on the mode
SERVICES=()
$START_BACKEND   && SERVICES+=(mqtt dynamodb backend)
$START_FRONTEND && SERVICES+=(frontend)

if [ "${#SERVICES[@]}" -gt 0 ]; then
    echo "${cyan}Starting Docker containers: ${SERVICES[*]}...${reset}"
    docker compose up -d --build "${SERVICES[@]}"
fi

# Wait for DynamoDB, create table, run test
if $START_BACKEND; then
    echo "${cyan}Waiting for DynamoDB to become available...${reset}"
    until curl -s http://localhost:8000 &>/dev/null; do
        printf '.'
        sleep 1
    done
    echo
    echo "${green}DynamoDB is up.${reset}"

    TELEMETRY_EXISTS=$(aws dynamodb list-tables \
        --endpoint-url http://localhost:8000 \
        --region us-west-1 | grep -c '"Telemetry"')
    if [ "$TELEMETRY_EXISTS" -eq 0 ]; then
        echo "${cyan}Creating DynamoDB table 'Telemetry'...${reset}"
        aws dynamodb create-table \
            --table-name Telemetry \
            --attribute-definitions AttributeName=device_id,AttributeType=S AttributeName=timestamp,AttributeType=N \
            --key-schema AttributeName=device_id,KeyType=HASH AttributeName=timestamp,KeyType=RANGE \
            --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
            --endpoint-url http://localhost:8000 --region us-west-1
    else
        echo "${green}DynamoDB table 'Telemetry' already exists.${reset}"
    fi
    DEVICES_EXIST=$(aws dynamodb list-tables \
        --endpoint-url http://localhost:8000 \
        --region us-west-1 | grep -c '"Devices"')
    if [ "$DEVICES_EXIST" -eq 0 ]; then
        echo "${cyan}Creating DynamoDB table 'Devices'...${reset}"
        aws dynamodb create-table \
            --table-name Devices \
            --attribute-definitions AttributeName=device_id,AttributeType=S \
            --key-schema AttributeName=device_id,KeyType=HASH \
            --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
            --endpoint-url http://localhost:8000 \
            --region us-west-1
    else
        echo "${green}DynamoDB table 'Devices' already exists.${reset}"
    fi
fi

# Shutdown hook for cleanup (no iTerm2 window management)
shutdown() {
    echo
    echo "${cyan}Shutting down Docker services...${reset}"
    docker compose down

    if [ -n "$MQTT_SUB_PID" ]; then
        echo "${cyan}Stopping MQTT listener (PID=$MQTT_SUB_PID)...${reset}"
        kill "$MQTT_SUB_PID" 2>/dev/null || true
    fi

    if [ -n "$FAKE_PY_PID" ]; then
        echo "${cyan}Stopping fake_device.py (PID=$FAKE_PY_PID)...${reset}"
        kill "$FAKE_PY_PID" 2>/dev/null || true
    fi

    echo "${green}Done. Clean exit.${reset}"
    exit 0
}

trap shutdown INT

# MQTT listener (if backend is running)
if $START_BACKEND; then
    echo "${cyan}Subscribing to MQTT messages on lora/devices/#...${reset}"
    mosquitto_sub -h localhost -t 'lora/devices/#' -v &
    MQTT_SUB_PID=$!
    echo "${green}MQTT listener started (PID=$MQTT_SUB_PID).${reset}"
fi

# Fake Devices
if [[ "$FAKE_DEVICES_COUNT" -gt 0 ]]; then
    echo "${cyan}Starting $FAKE_DEVICES_COUNT fake device(s)...${reset}"

    if [ -d ".venv" ]; then
        source .venv/bin/activate
    fi

    python3 scripts/fake_device.py --count "$FAKE_DEVICES_COUNT" --interval 15 &
    FAKE_PY_PID=$!
    echo "${green}Fake devices running (PID=$FAKE_PY_PID)${reset}"
fi

# Tail logs
if [ "${#SERVICES[@]}" -gt 0 ]; then
    echo
    echo "${cyan}Attaching to Docker logs — Ctrl+C to stop...${reset}"
    docker compose logs -f "${SERVICES[@]}"
fi

