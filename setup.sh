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
        *)
            echo "Unknown option: $1"
            echo "Usage: ./setup.sh [--backend-only|--frontend-only|--esp-only] [--build] [--flash] [--monitor] [--port <path>]"
            exit 1 ;;
    esac
    shift
done


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
    if command idf.py -v &> /dev/null; then
        ESP_IDF_READY=true
    elif [ -f "$HOME/esp/esp-idf/export.sh" ]; then
        echo "${cyan}Sourcing ESP-IDF environment...${reset}"
        # Source export.sh (enables idf.py and related tools)
        . "$HOME/esp/esp-idf/export.sh"
        # Re-check idf.py now
        if command -v idf.py &> /dev/null; then
            ESP_IDF_READY=true
        else
            echo "${red}ESP-IDF sourcing failed — idf.py still not found.${reset}"
        fi
    else
        echo "${red}ESP-IDF export.sh not found at \$HOME/esp/esp-idf/. ESP toolchain won't be available.${reset}"
    fi
fi

ITERM_WINDOW_NAME="LoRa-IDF-Monitor"

# Run ESP32 actions in iTerm
run_idf_in_iterm() {
    FIRMWARE_DIR="$(pwd)/firmware"
    if [ ! -d "$FIRMWARE_DIR" ]; then
        echo "${red}Firmware directory not found: $FIRMWARE_DIR${reset}"
        return
    fi

    if [ -z "$ESP_PORT" ]; then
        ESP_PORT=$(ls /dev/tty.usb* 2>/dev/null | head -n 1)
    fi

    if [ -z "$ESP_PORT" ]; then
        echo "${cyan}No ESP32 device detected (no /dev/tty.usb* found). Skipping ESP32 actions.${reset}"
        return
    fi

    if ! $ESP_IDF_READY; then
        echo "${red}ESP-IDF not found or not sourced correctly — cannot run idf.py.${reset}"
        return
    fi

    echo "${cyan}Launching ESP32 tasks in iTerm2...${reset}"
    ESP_COMMAND="cd $FIRMWARE_DIR && source \$HOME/esp/esp-idf/export.sh"

    $ESP_BUILD   && ESP_COMMAND+=" && idf.py -f build"
    $ESP_FLASH   && ESP_COMMAND+=" && idf.py -p $ESP_PORT flash"
    $ESP_MONITOR && ESP_COMMAND+=" && idf.py -p $ESP_PORT monitor"
    
    ITERM_WINDOW_ID=$(
        /usr/bin/osascript <<EOF
    tell application "iTerm"
        activate
        set newWindow to (create window with default profile)
        set windowID to id of newWindow
        tell current session of newWindow
            write text "cd $FIRMWARE_DIR && source \$HOME/esp/esp-idf/export.sh $EXTRA && $ESP_COMMAND; exit"
        end tell
        return windowID
    end tell
EOF
)

}

# Run ESP32 actions if asked
if $ESP_ACTION_REQUESTED && $ESP_IDF_READY; then
    run_idf_in_iterm
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

    TABLE_EXISTS=$(aws dynamodb list-tables \
        --endpoint-url http://localhost:8000 \
        --region us-west-1 | grep -c '"Telemetry"')
    if [ "$TABLE_EXISTS" -eq 0 ]; then
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
fi

# Shutdown hook for cleanup
shutdown() {
    #Attempting to close iTerm2 ESP32 monitor window
    if [ -n "$ITERM_WINDOW_ID" ]; then
        echo "${cyan}Closing iTerm2 window (ID: $ITERM_WINDOW_ID)...${reset}"
        /usr/bin/osascript <<EOF
        tell application "iTerm"
            try
                repeat with w in windows
                    if id of w is $ITERM_WINDOW_ID then
                        close w
                        exit repeat
                    end if
                end repeat
            end try
        end tell
EOF
fi

    echo
    echo "${cyan}Shutting down Docker services...${reset}"
    docker compose down

    if [ -n "$MQTT_SUB_PID" ]; then
        echo "${cyan}Stopping MQTT listener (PID=$MQTT_SUB_PID)...${reset}"
        kill "$MQTT_SUB_PID" 2>/dev/null || true
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

# Tail logs
if [ "${#SERVICES[@]}" -gt 0 ]; then
    echo
    echo "${cyan}Attaching to Docker logs — Ctrl+C to stop...${reset}"
    docker compose logs -f "${SERVICES[@]}"
fi

