#!/bin/bash
set -e

cyan=$(tput setaf 6)
green=$(tput setaf 2)
reset=$(tput sgr0)

# Default mode
START_BACKEND=true
START_FRONTEND=true

# Parse flags
for arg in "$@"; do
    case $arg in
        --backend-only)
            START_FRONTEND=false
            ;;
        --frontend-only)
            START_BACKEND=false
            ;;
        *)
            echo "Usage: $0 [--backend-only | --frontend-only]"
            exit 1
            ;;
    esac
done

echo "${cyan}LoRa Dashboard Dev Setup (${green}${START_BACKEND:+backend}${START_FRONTEND:+ + frontend}${cyan})${reset}"

# Function to check commands
check_command() {
    if ! command -v "$1" &> /dev/null; then
        echo "${red}$1 not found. Please install it.${reset}"
        exit 1
    fi
}

echo "${cyan}Checking system requirements...${reset}"
check_command docker
check_command python3
check_command pip
check_command npm
check_command aws

if ! command -v idf.py &> /dev/null; then
    echo "ESP-IDF not found in PATH. Please activate your ESP-IDF environment manually."
fi

# Set up Python virtualenv
if $START_BACKEND; then
    if [ ! -d ".venv" ]; then
        echo "${cyan}Creating Python venv...${reset}"
        python3 -m venv .venv
    fi

    echo "${cyan}Activating venv and installing Python packages...${reset}"
    source .venv/bin/activate
    pip install --upgrade pip
    pip install boto3 fastapi uvicorn
fi

# Start Docker containers based on mode
SERVICES=()

if $START_BACKEND; then
    SERVICES+=(mqtt dynamodb)
fi

if $START_FRONTEND; then
    SERVICES+=(frontend)
fi

echo "${cyan}Starting Docker containers: ${SERVICES[*]}...${reset}"
docker compose up -d "${SERVICES[@]}"

if $START_BACKEND; then
    # Wait for DynamoDB to be ready
    echo "${cyan}Waiting for DynamoDB to be ready...${reset}"
    until curl -s http://localhost:8000 > /dev/null; do
        printf "."
        sleep 1
    done
    echo
    echo "${green}DynamoDB is up.${reset}"

    # Ensure DynamoDB table exists
    echo "${cyan}Ensuring DynamoDB table 'Telemetry' exists...${reset}"
    TABLE_EXISTS=$(aws dynamodb list-tables \
        --endpoint-url http://localhost:8000 \
        --region us-east-1 | grep -c '"Telemetry"')

    if [ "$TABLE_EXISTS" -eq 0 ]; then
        echo "${cyan}Creating DynamoDB table 'Telemetry'...${reset}"
        aws dynamodb create-table \
          --table-name Telemetry \
          --attribute-definitions \
              AttributeName=device_id,AttributeType=S \
              AttributeName=timestamp,AttributeType=N \
          --key-schema \
              AttributeName=device_id,KeyType=HASH \
              AttributeName=timestamp,KeyType=RANGE \
          --provisioned-throughput \
              ReadCapacityUnits=5,WriteCapacityUnits=5 \
          --endpoint-url http://localhost:8000 \
          --region us-east-1
    else
        echo "${green}DynamoDB table 'Telemetry' already exists.${reset}"
    fi

    # Run test script
    echo "${cyan}Running backend test (test_db.py)...${reset}"
    python backend/test_db.py

    echo "${cyan}If your ESP32 is connected, run:${reset}"
    echo "${green}  idf.py -p \$(ls /dev/tty.usb*) flash monitor${reset}"
fi

# Shutdown hook
shutdown() {
    echo
    echo "${cyan}Stopping Docker services...${reset}"
    docker compose down

    if [ -n "$MQTT_SUB_PID" ]; then
        echo "${cyan}Stopping MQTT subscriber (PID: $MQTT_SUB_PID)...${reset}"
        kill "$MQTT_SUB_PID" 2>/dev/null || true
    fi

    echo "${green}Done. Clean shutdown.${reset}"
    exit 0
}


trap shutdown INT

# Attach logs to running containers
echo
echo "${cyan}Attaching to Docker logs — press Ctrl+C to stop...${reset}"
# Optionally show MQTT topic messages if backend is being used
if $START_BACKEND; then
    echo
    echo "${cyan}Subscribing to MQTT topic 'lora/devices/#'...${reset}"
    mosquitto_sub -h localhost -t 'lora/devices/#' -v &
    MQTT_SUB_PID=$!
    echo "${green}Subscribed to MQTT. PID: $MQTT_SUB_PID${reset}"
fi

echo
echo "${cyan}Attaching to Docker logs — press Ctrl+C to stop everything...${reset}"
docker compose logs -f "${SERVICES[@]}"

