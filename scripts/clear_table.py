import boto3
from decimal import Decimal
from datetime import datetime, timedelta
import random

dynamodb = boto3.resource(
    "dynamodb", region_name="us-west-1", endpoint_url="http://localhost:8000"
)
tables = ["Devices", "Telemetry"]

for table_name in tables:
    table = dynamodb.Table(table_name)
    scan = table.scan()
    with table.batch_writer() as batch:
        for item in scan["Items"]:
            key = {"device_id": item["device_id"]}
            if "timestamp" in item:
                key["timestamp"] = item["timestamp"]
            batch.delete_item(Key=key)

print("Tables cleared.")


def random_device_id():
    return "".join(random.choices("0123456789ABCDEF", k=12))


device_ids = [random_device_id() for _ in range(5)]
devices_table = dynamodb.Table("Devices")

with devices_table.batch_writer() as batch:
    for device_id in device_ids:
        batch.put_item(Item={"device_id": device_id})

print("Devices seeded.")

# Telemetry
telemetry_table = dynamodb.Table("Telemetry")
now = datetime.now()

entries_per_day = 24  # Every hour
days = 30
total_entries_per_device = entries_per_day * days  # 720

with telemetry_table.batch_writer() as batch:
    for device_id in device_ids:
        for i in range(total_entries_per_device):
            dt = now - timedelta(hours=i)
            timestamp = int(dt.timestamp() * 1000)  # Epoch ms
            temperature = Decimal(str(round(random.uniform(22.0, 30.0), 2)))
            uptime_ms = Decimal((i + 1) * 60 * 60 * 1000)  # 1 hour in ms

            batch.put_item(
                Item={
                    "device_id": device_id,
                    "timestamp": timestamp,
                    "temperature": temperature,
                    "uptime_ms": uptime_ms,
                }
            )

print("Telemetry seeded for past month.")
