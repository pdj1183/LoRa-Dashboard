# LoRa Dashboard – Backend

This is the **backend service** for the LoRa Dashboard project. It acts as a bridge between ESP32 LoRa devices (publishing MQTT telemetry) and the frontend dashboard that visualizes the data.

---

## Features

- Subscribes to telemetry data via MQTT (`lora/devices/#`)
- Stores device data in **DynamoDB**
- Serves historical data via **REST API**
- Sends live telemetry to the frontend via **WebSocket**
- Runs under **FastAPI** with CORS enabled for frontend use

---

## Project Structure

```bash
backend/
├── app/
│   ├── api.py              # REST API routes
│   ├── config.py           # Placeholder for configuration settings
│   ├── dynamodb.py         # DynamoDB read/write helpers
│   ├── main.py             # FastAPI app + MQTT listener startup
│   ├── models.py           # (optional) Pydantic models or DB schema
│   ├── mqtt_listener.py    # Subscribes to MQTT and processes data
│   ├── websocket.py        # WebSocket route handling
│   └── websocket_manager.py# Manages active WebSocket clients
├── Dockerfile
├── requirements.txt
````

---

## Basic Info

##### 1. **MQTT Listener** (mqtt_listener.py)
* Connects to the broker at startup
* Listens to lora/devices/# topic
* Parses incoming JSON payloads
* Writes data to the Telemetry table in DynamoDB
* Broadcasts payloads to active WebSocket clients

##### 2. **REST API** (api.py)
* Provides endpoints to fetch historical telemetry data
* Query by device_id, time ranges, etc.

##### 3. WebSocket API (websocket.py)
* Clients subscribe to live updates
* Supports real-time charts on the frontend

##### 4. DynamoDB Tables
* Telemetry: Stores device_id + timestamp as primary keys
* Devices: (Optional) Stores registered device metadata

---

## Local Development

Use the setup.sh to automate the startup.

To run manually:
##### 1. Install dependencies
```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

##### 2. Start DynamoDB locally (via Docker)
```bash
docker compose up dynamodb
```

##### 3. Create DynamoDB Tables
```bash 
aws dynamodb create-table \
  --table-name Telemetry \
  --attribute-definitions AttributeName=device_id,AttributeType=S AttributeName=timestamp,AttributeType=N \
  --key-schema AttributeName=device_id,KeyType=HASH AttributeName=timestamp,KeyType=RANGE \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:8000 --region us-west-1

aws dynamodb create-table \
  --table-name Devices \
  --attribute-definitions AttributeName=device_id,AttributeType=S \
  --key-schema AttributeName=device_id,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:8000 \
  --region us-west-1
```

##### 4. Run Backend
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```
 ---

## API Overview

##### REST
* GET /api/telemetry?device_id=abc123&start_date=timestamp&end_date=timestamp
* GET /api/telemetry/chart/all?start_date=timestamp&end_date=timestamp
* GET /api/telemetry/all
* GET /api/telemetry/devices

##### WebSocket
* Connect to: ws://localhost:8001/ws/telemetry/{device_id}
* Connect to: ws://localhost:8001/ws/telemetry/all
* Receives live JSON telemetry updates as they’re published
