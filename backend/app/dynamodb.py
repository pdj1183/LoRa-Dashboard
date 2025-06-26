from datetime import datetime
import boto3
from boto3.dynamodb.conditions import Key
import os
from decimal import Decimal
from collections import defaultdict


dynamodb = boto3.resource(
    "dynamodb",
    endpoint_url=os.getenv("DYNAMODB_URL", "http://localhost:8000"),
    region_name=os.getenv("AWS_REGION", "us-west-1"),
    aws_access_key_id=os.getenv("AWS_ACCESS_KEY_ID"),
    aws_secret_access_key=os.getenv("AWS_SECRET_ACCESS_KEY"),
)

table = dynamodb.Table("Telemetry")


def save_telemetry(device_id, data):
    item = {
        "device_id": device_id,
        "timestamp": int(datetime.utcnow().timestamp()),
        **data,
    }
    for key, val in item.items():
        if isinstance(val, float):
            item[key] = Decimal(str(val))
    table.put_item(Item=item)
    print(f"[DynamoDB] Saved to DynamoDB: {item}", flush=True)


def update_device_entry(device_id: str):
    device_table = dynamodb.Table("Devices")
    last_seen = int(datetime.utcnow().timestamp())

    item = {
        "device_id": device_id,
        "last_seen": last_seen,
        "status": "online",  # optional field
    }

    device_table.put_item(Item=item)
    print(f"[DynamoDB] Updated Devices table: {item}", flush=True)


async def get_db_telemetry(device_id):
    response = table.query(KeyConditionExpression=Key("device_id").eq(device_id))
    return response["Items"]


def get_all_telemetry():
    response = table.scan()
    items = response["Items"]

    grouped = defaultdict(list)
    for item in items:
        device_id = item["device_id"]
        grouped[device_id].append(item)

    return grouped


def list_device_ids():
    device_table = dynamodb.Table("Devices")
    response = device_table.scan(ProjectionExpression="device_id")
    return [item["device_id"] for item in response.get("Items", [])]
