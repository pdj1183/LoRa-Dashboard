# app/dynamodb.py

from datetime import datetime
from typing import Text
import boto3
from boto3.dynamodb.conditions import Key
import os

dynamodb = boto3.resource(
    'dynamodb',
    endpoint_url=os.getenv('DYNAMODB_URL', 'http://localhost:8000'),
    region_name=os.getenv('AWS_REGION', 'us-west-1'),
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY')
)

table = dynamodb.Table('Telemetry')

def save_telemetry(device_id, data):
    item = {
        'device_id': device_id,
        'timestamp': int(datetime.utcnow().timestamp()),
        **data
    }
    table.put_item(Item=item)
    print(f"[DynamoDB] Saved to DynamoDB: {item}", flush=True)

async def get_db_telemetry(device_id):
    response = table.query(
        KeyConditionExpression=Key('device_id').eq(device_id)
    )
    return response['Items']

