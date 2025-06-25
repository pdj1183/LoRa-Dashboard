import aioboto3
import os

DYNAMODB_URL = os.getenv("DYNAMODB_URL", "http://localhost:8000")
REGION = os.getenv("AWS_REGION", "us-west-1")

session = aioboto3.Session()

async def get_telemetry_items(device_id: str, start_ts: int, end_ts: int):
    async with session.resource('dynamodb', endpoint_url=DYNAMODB_URL, region_name=REGION) as dynamodb:
        table = await dynamodb.Table("Telemetry")
        response = await table.query(
            KeyConditionExpression="device_id = :id AND #ts BETWEEN :start AND :end",
            ExpressionAttributeValues={
                ":id": device_id,
                ":start": start_ts,
                ":end": end_ts
            },
            ExpressionAttributeNames={
                "#ts": "timestamp"
            }
        )
        return response.get("Items", [])

