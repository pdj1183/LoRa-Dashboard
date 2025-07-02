# LoRa Dashboard – Local DynamoDB Setup

This folder manages the **local DynamoDB instance** used by the backend to store device and telemetry data.

---

## Tables Used

1. **Telemetry**  
   Stores time-series sensor data  
   - Partition key: `device_id` (string)  
   - Sort key: `timestamp` (number)

2. **Devices**  
   Stores metadata per device (not fully used yet)  
   - Partition key: `device_id` (string)

---

## Local DynamoDB via Docker

DynamoDB runs inside a container using Docker Compose:

```yaml
dynamodb:
  image: amazon/dynamodb-local
  command: "-jar DynamoDBLocal.jar -sharedDb -dbPath /home/dynamodblocal/data -port 8000"
  volumes:
    - ./dynamodb/data:/home/dynamodblocal/data
  ports:
    - "8000:8000"
```

---

## Setup Tables (CLI)

Create both tables after the container is up:

```bash
aws dynamodb create-table \
  --table-name Telemetry \
  --attribute-definitions \
      AttributeName=device_id,AttributeType=S \
      AttributeName=timestamp,AttributeType=N \
  --key-schema \
      AttributeName=device_id,KeyType=HASH \
      AttributeName=timestamp,KeyType=RANGE \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:8000 \
  --region us-west-1
```

```bash
aws dynamodb create-table \
  --table-name Devices \
  --attribute-definitions AttributeName=device_id,AttributeType=S \
  --key-schema AttributeName=device_id,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
  --endpoint-url http://localhost:8000 \
  --region us-west-1
```

These steps are handled automatically in setup.sh.

---

## Inspecting Data

Install AWS CLI and use:
```bash
aws dynamodb scan --table-name Telemetry \
  --endpoint-url http://localhost:8000 --region us-west-1
```

---

## Notes
* Local DynamoDB does not require real AWS credentials, but fake ones must be set
* Backend uses env vars:
* AWS_ACCESS_KEY_ID=some_id
* AWS_SECRET_ACCESS_KEY=some_key
* DYNAMODB_URL=http://dynamodb:8000

---

## Related Files
* setup.sh: Auto-starts DynamoDB + creates tables and creates environment variables
* backend/app/dynamodb.py: Python logic for inserting/querying
